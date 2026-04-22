const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashed,
      name: 'Chủ nhà Test',
      settings: {
        create: {
          shopName: 'Nhà trọ Hoa Hồng',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          phone: '0901234567',
        },
      },
    },
  });
  console.log('Seeded user:', user.email);

  await prisma.room.createMany({
    data: [
      { name: 'Phòng 101', floor: 1, area: 20, baseRent: 2500000, userId: user.id },
      { name: 'Phòng 102', floor: 1, area: 18, baseRent: 2200000, userId: user.id },
      { name: 'Phòng 201', floor: 2, area: 25, baseRent: 3000000, userId: user.id },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded 3 rooms');
}

main().catch(console.error).finally(() => prisma.$disconnect());
