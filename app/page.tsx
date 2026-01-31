// app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const dungeons = await prisma.dungeon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
          DUNGEON EXPLORER
        </h1>

        <div className="grid gap-6 sm:grid-cols-2">
          {dungeons.map((dungeon) => (
            <Link
              key={dungeon.id}
              href={`/play?id=${dungeon.id}`}
              className="group block p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all hover:scale-105 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold group-hover:text-yellow-400 transition-colors">
                  {dungeon.name}
                </h2>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                  Lv.{dungeon.difficulty}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {dungeon.description ||
                  "未知のダンジョンがあなたを待っている..."}
              </p>
              <div className="flex justify-between items-center text-sm font-mono text-gray-500">
                <span>Time: {dungeon.timeLimit}s</span>
                <span className="text-yellow-600 group-hover:text-yellow-400 font-bold">
                  PLAY START →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {dungeons.length === 0 && (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-dashed border-gray-600">
            <p className="text-gray-500">ダンジョンが登録されていません。</p>
            <p className="text-sm text-gray-600">
              Prisma Studioなどでデータを追加してください。
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
