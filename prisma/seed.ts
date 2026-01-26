import { prisma } from '@/lib/prisma';

async function main() {
  // 既存データを削除してクリーンにする
  await prisma.dungeon.deleteMany();

  await prisma.dungeon.create({
    data: {
      name: "sample dungeon",
      timeLimit: 100,
      difficulty: 1,
      mapData: JSON.stringify({
        tiles: [
          ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
          ['W', 'P', ' ', ' ', ' ', ' ', 'S1', 'W'],
          ['W', 'W', 'W', 'BW3', 'W', 'W', ' ', 'W'],
          ['W', ' ', ' ', ' ', ' ', 'BW1', ' ', 'W'],
          ['W', ' ', 'BW3', 'W', ' ', ' ', 'G', 'W'],
          ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
        ]
      })
    }
  });
  console.log("Seed data created successfully!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());