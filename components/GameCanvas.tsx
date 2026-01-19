'use client';
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '@/game/scenes/MainScene';

interface GameCanvasProps {
  mapData: number[][];
}

export default function GameCanvas({ mapData }: GameCanvasProps) {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      physics: { default: 'arcade' },
      scene: [MainScene],
    };

    const game = new Phaser.Game(config);

    // シーンが準備できたらデータを渡して開始
    game.scene.start('MainScene', { mapData });

    return () => {
      game.destroy(true); // コンポーネント破棄時にゲームも終了
    };
  }, [mapData]);

  return <div ref={gameRef} className="border-4 border-gray-700 rounded-lg overflow-hidden" />;
}