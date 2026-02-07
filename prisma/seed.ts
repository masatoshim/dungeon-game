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

  await prisma.dungeon.create({
    data: {
      name: "鍵と扉",
      description: "鍵を手に入れて扉を開くダンジョン",
      timeLimit: 120,
      difficulty: 1,
      status: "PUBLISHED",
      isTemplate: true,
      createdBy: "system",
      updatedBy: "system",
      mapData: JSON.stringify({
        tiles: [
          ["W", "W", "W", "W", "W", "W"],
          ["W", "P", " ", " ", " ", "W"],
          ["W", " ", " ", " ", " ", "W"],
          ["W", " ", " ", "W", " ", "W"],
          ["W", " ", " ", "W", "G", "W"],
          ["W", "W", "W", "W", "W", "W"],
        ],
        entities: [
          {
            id: "door_A",
            type: "DOOR",
            x: 4,
            y: 3,
            properties: { tileId: "KD1", targetId: "key_A" }, // 鍵扉を指定
          },
          {
            id: "key_A",
            type: "KEY",
            x: 2,
            y: 2,
            properties: { tileId: "K1", targetId: "door_A" }, // 鍵を指定
          },
        ],
      }),
    },
  });

  await prisma.dungeon.create({
    data: {
      name: "ボタンと扉",
      description: "ボタンを押して扉を開くダンジョン",
      timeLimit: 120,
      difficulty: 1,
      status: "PUBLISHED",
      isTemplate: true,
      createdBy: "system",
      updatedBy: "system",
      mapData: JSON.stringify({
        tiles: [
          ["W", "W", "W", "W", "W", "W"],
          ["W", "P", " ", " ", " ", "W"],
          ["W", " ", " ", " ", " ", "W"],
          ["W", "R1", " ", "W", " ", "W"],
          ["W", " ", " ", "W", "G", "W"],
          ["W", "W", "W", "W", "W", "W"],
        ],
        entities: [
          {
            id: "door_A",
            type: "DOOR",
            x: 4,
            y: 3,
            properties: { tileId: "D1" },
          },
          {
            id: "btn_A",
            type: "BUTTON",
            x: 1,
            y: 4,
            properties: { tileId: "B1", targetId: "door_A" },
          },
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
