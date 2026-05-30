const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function runBackup() {
  console.log('[GDrive Backup] Starting backup upload...');

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!serviceAccountKey) {
    console.error('[GDrive Backup] Error: GOOGLE_SERVICE_ACCOUNT_KEY is missing!');
    process.exit(1);
  }

  if (!folderId) {
    console.error('[GDrive Backup] Error: GOOGLE_DRIVE_FOLDER_ID is missing!');
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountKey);
  } catch (err) {
    console.error('[GDrive Backup] Error parsing GOOGLE_SERVICE_ACCOUNT_KEY JSON:', err.message);
    process.exit(1);
  }

  const backupFilePath = path.join(__dirname, '..', 'backup.sql');
  if (!fs.existsSync(backupFilePath)) {
    console.error(`[GDrive Backup] Error: Backup file not found at ${backupFilePath}`);
    process.exit(1);
  }

  try {
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive.file']
    );

    const drive = google.drive({ version: 'v3', auth });

    const todayStr = new Date().toISOString().split('T')[0];
    const fileName = `house-renting-backup-${todayStr}.sql`;

    console.log(`[GDrive Backup] Uploading file '${fileName}' to GDrive folder '${folderId}'...`);

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: 'text/plain',
      body: fs.createReadStream(backupFilePath),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
    });

    console.log(`[GDrive Backup] ✅ Success! Uploaded successfully. GDrive File ID: ${response.data.id}`);
    console.log(`[GDrive Backup] WebView Link: ${response.data.webViewLink}`);
  } catch (error) {
    console.error('[GDrive Backup] ❌ Error during upload:', error.message);
    process.exit(1);
  }
}

runBackup();
