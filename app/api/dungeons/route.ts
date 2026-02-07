import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, timeLimit, mapData, status } = body;

    const dungeon = await prisma.dungeon.create({
      data: {
        name,
        description,
        timeLimit: Number(timeLimit),
        mapData: JSON.stringify(mapData), // オブジェクトを文字列化
        status,
        difficulty: 1, // 初期値
        isTemplate: false,
      },
    });

    return NextResponse.json(dungeon);
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}
