import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Dungeon, MapData } from "@/types";
const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
});
const GameUI = dynamic(() => import("@/components/GameUI"), { ssr: false });

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) return notFound();

  const dungeon: Dungeon | null = await prisma.dungeon.findUnique({
    where: { id: id },
  });

  if (!dungeon) return notFound();

  const parsedMapData: MapData = JSON.parse(dungeon.mapData);

  return (
    <main className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">{dungeon.name}</h1>

      <div className="relative border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <GameCanvas mapData={parsedMapData} timeLimit={dungeon.timeLimit} />
        <GameUI />
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-semibold text-yellow-500">
            難易度: {dungeon.difficulty}
          </span>
          <span className="text-xl font-semibold text-blue-400">
            制限時間: {dungeon.timeLimit}s
          </span>
        </div>
        <p className="text-gray-300 italic mb-4">
          {dungeon.description || "説明はありません"}
        </p>
        <div className="text-sm text-gray-400 bg-gray-900 p-2 rounded">
          🎮 操作: 矢印キーで移動 / スペースキーで攻撃
        </div>
      </div>
    </main>
  );
}
