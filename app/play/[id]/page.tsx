'use client';
import dynamic from 'next/dynamic';

// Phaserはブラウザでのみ動作するため、SSRを無効にしてインポート
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), { ssr: false });

export default function PlayPage() {
  // 本来はここでDB（Supabase等）からデータをfetchする
  const mockMapData = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 3, 1],
    [1, 1, 1, 1, 1],
  ];

  return (
    <main className="flex flex-col items-center p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">ダンジョン攻略</h1>
      <GameCanvas mapData={mockMapData} />
      <div className="mt-4 p-4 bg-gray-800 rounded">
        <p>操作方法: 矢印キーで移動 / 武器を駆使して出口（緑）を目指せ！</p>
      </div>
    </main>
  );
}