import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Start seeding...");

  // 既存データを一掃してクリーンにする
  await prisma.dungeon.deleteMany();

  await prisma.dungeon.create({
    data: {
      name: "シンプル",
      description:
        "開始位置からゴールまで制限時間内にゴールするだけのシンプルなダンジョン",
      timeLimit: 10,
      difficulty: 1,
      status: "PUBLISHED",
      isTemplate: true,
      createdBy: "system",
      updatedBy: "system",
      mapData: JSON.stringify({
        tiles: [
          ["W", "W", "W", "W", "W"],
          ["W", "P", " ", " ", "W"],
          ["W", " ", " ", " ", "W"],
          ["W", " ", " ", "G", "W"],
          ["W", "W", "W", "W", "W"],
        ],
      }),
    },
  });

  await prisma.dungeon.create({
    data: {
      name: "壊せる壁",
      description: "アイテムを入手し壁を壊してゴールするダンジョン",
      timeLimit: 120,
      difficulty: 1,
      status: "PUBLISHED",
      isTemplate: true,
      createdBy: "system",
      updatedBy: "system",
      mapData: JSON.stringify({
        tiles: [
          ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
          ["W", "P", "W", "S1", "W", " ", " ", " ", "W"],
          ["W", " ", "W", " ", "W", " ", "W", " ", "W"],
          ["W", " ", "W", " ", "W", " ", "W", "BW1", "W"],
          ["W", " ", " ", " ", "BW1", " ", "W", "G", "W"],
          ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
        ],
      }),
    },
  });

  await prisma.dungeon.create({
    data: {
      name: "動かせる石",
      description: "邪魔な石を動かしてゴールするダンジョン",
      timeLimit: 120,
      difficulty: 1,
      status: "PUBLISHED",
      isTemplate: true,
      createdBy: "system",
      updatedBy: "system",
      mapData: JSON.stringify({
        tiles: [
          ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
          ["W", "P", " ", " ", " ", " ", " ", " ", "W"],
          ["W", " ", "R3", " ", "R1", " ", " ", " ", "W"],
          ["W", " ", " ", "R1", "R1", " ", " ", " ", "W"],
          ["W", " ", " ", "W", "G", "W", " ", " ", "W"],
          ["W", " ", " ", "W", "W", "W", " ", " ", "W"],
          ["W", " ", " ", " ", " ", " ", " ", " ", "W"],
          ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
        ],
      }),
    },
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
