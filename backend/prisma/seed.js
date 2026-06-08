const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureRoom(userId, roomData) {
  const existingRoom = await prisma.room.findFirst({
    where: {
      userId,
      name: roomData.name,
      floor: roomData.floor,
      area: roomData.area,
      baseRent: roomData.baseRent,
    },
  });

  if (existingRoom) {
    return existingRoom;
  }

  return prisma.room.create({
    data: {
      ...roomData,
      userId,
    },
  });
}

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

  const seedRooms = [
    { name: 'Phòng 101', floor: 1, area: 20, baseRent: 2500000 },
    { name: 'Phòng 102', floor: 1, area: 18, baseRent: 2200000 },
    { name: 'Phòng 201', floor: 2, area: 25, baseRent: 3000000 },
  ];

  const [room101] = await Promise.all(seedRooms.map((roomData) => ensureRoom(user.id, roomData)));
  console.log('Seeded 3 rooms');

  const existingTenant = await prisma.tenant.findFirst({
    where: { roomId: room101.id, name: 'Khách Thuê Mẫu' },
  });

  if (existingTenant) {
    await prisma.tenant.update({
      where: { id: existingTenant.id },
      data: {
        phone: '0901234567',
        zaloContact: 'zalo-admin-seed',
      },
    });
  } else {
    await prisma.tenant.create({
      data: {
        name: 'Khách Thuê Mẫu',
        phone: '0901234567',
        zaloContact: 'zalo-admin-seed',
        roomId: room101.id,
        moveInDate: new Date('2026-01-01'),
        deposit: 1000000,
      },
    });
  }

  await prisma.room.update({
    where: { id: room101.id },
    data: { status: 'OCCUPIED' },
  });

  console.log('Seeded sample tenant contact');
}

main().catch(console.error).finally(() => prisma.$disconnect());
