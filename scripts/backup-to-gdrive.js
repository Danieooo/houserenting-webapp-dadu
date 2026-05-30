const { Client } = require('pg');
const { google } = require('googleapis');

async function runBackup() {
  console.log('[GDrive Backup] Starting self-contained backup process...');

  const dbUrl = process.env.DATABASE_URL;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!dbUrl) {
    console.error('[GDrive Backup] Error: DATABASE_URL is missing!');
    process.exit(1);
  }

  if (!folderId) {
    console.error('[GDrive Backup] Error: GOOGLE_DRIVE_FOLDER_ID is missing!');
    process.exit(1);
  }

  const isOAuth2 = !!refreshToken && !!clientId && !!clientSecret;

  if (!isOAuth2 && !serviceAccountKey) {
    console.error('[GDrive Backup] Error: Neither GOOGLE_SERVICE_ACCOUNT_KEY nor GOOGLE_REFRESH_TOKEN (along with Client ID & Secret) is configured!');
    process.exit(1);
  }

  // Clean the database URL (strip leading/trailing double quotes)
  const cleanDbUrl = dbUrl.replace(/^"/, '').replace(/"$/, '');

  let credentials;
  if (!isOAuth2 && serviceAccountKey) {
    try {
      credentials = JSON.parse(serviceAccountKey);
    } catch (err) {
      console.error('[GDrive Backup] Error parsing GOOGLE_SERVICE_ACCOUNT_KEY JSON:', err.message);
      process.exit(1);
    }
  }

  const backupData = {
    timestamp: new Date().toISOString(),
    version: '1.4.0',
    tables: {}
  };

  const tables = ['User', 'RefreshToken', 'Settings', 'Room', 'Tenant', 'TenantFile', 'Invoice'];

  console.log('[GDrive Backup] Connecting to Neon PostgreSQL database...');
  const client = new Client({
    connectionString: cleanDbUrl,
    ssl: { rejectUnauthorized: false } // Required for Neon secure connection
  });

  try {
    await client.connect();
    console.log('[GDrive Backup] Connected successfully!');
    
    // Print all existing tables in public schema for debugging
    const tablesCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    console.log('[GDrive Backup] Debug - Tables found in public schema:', tablesCheck.rows.map(r => r.table_name).join(', ') || 'NONE');

    console.log('[GDrive Backup] Fetching table data...');

    for (const table of tables) {
      console.log(`[GDrive Backup] Fetching table "${table}"...`);
      const res = await client.query(`SELECT * FROM "${table}"`);
      backupData.tables[table] = res.rows;
      console.log(`[GDrive Backup] -> Fetched ${res.rows.length} rows from "${table}"`);
    }

    console.log('[GDrive Backup] ✅ All tables fetched successfully!');
  } catch (error) {
    console.error('[GDrive Backup] ❌ Database extraction failed:', error.message);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }

  // Now, upload to Google Drive
  try {
    let auth;
    if (isOAuth2) {
      console.log('[GDrive Backup] Authenticating with Google Drive API via OAuth2 (User Account)...');
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      auth = oauth2Client;
    } else {
      console.log('[GDrive Backup] Authenticating with Google Drive API via Service Account...');
      // Clean and fix private key newlines in case it was escaped in GitHub Secrets
      const privateKey = credentials.private_key.replace(/\\n/g, '\n');
      auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: credentials.client_email,
          private_key: privateKey,
        },
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive'
        ],
      });
    }

    const drive = google.drive({ version: 'v3', auth });

    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `house-renting-backup-${todayStr}.json`;

    console.log(`[GDrive Backup] Uploading file '${fileName}' to GDrive folder '${folderId}'...`);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    // Serialize data to JSON string buffer
    const jsonString = JSON.stringify(backupData, null, 2);
    const bufferStream = require('stream').Readable.from([jsonString]);

    const media = {
      mimeType: 'application/json',
      body: bufferStream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true // Bật để hỗ trợ tải lên các thư mục thuộc Shared Drives nếu có
    });

    console.log(`[GDrive Backup] ✅ Success! Database backup saved to Google Drive.`);
    console.log(`[GDrive Backup] GDrive File ID: ${response.data.id}`);
    console.log(`[GDrive Backup] WebView Link: ${response.data.webViewLink}`);
  } catch (error) {
    console.error('[GDrive Backup] ❌ Google Drive upload failed:', error.message);
    process.exit(1);
  }
}

runBackup();
