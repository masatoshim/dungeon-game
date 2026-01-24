import dynamic from 'next/dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { GameUI } from '@/components/GameUI';

// Phaserコンポーネントはクライアントサイドでのみ実行
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false });

export default async function PlayPage() {
  // DBから特定のダンジョンを取得 (例として最初の1件)
  const dungeon = await prisma.dungeon.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!dungeon) {
    return notFound();
  }

  const parsedMapData = JSON.parse(dungeon.mapData);

  return (
    <main className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white relative">
      <h1 className="text-3xl font-bold mb-4">{dungeon.name}</h1>
      
      <div className="relative">
        <GameCanvas 
          mapData={parsedMapData.tiles} 
          timeLimit={dungeon.timeLimit} 
        />
        <GameUI />
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded">
        <p>難易度: {dungeon.difficulty} / 制限時間: {dungeon.timeLimit}秒</p>
        <p className="text-sm text-gray-400 mt-2">操作方法: 矢印キーで移動 / スペースで攻撃</p>
      </div>
    </main>
  );
}