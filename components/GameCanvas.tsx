'use client';
import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { MainScene } from '@/game/scenes/MainScene';
import { TileId } from '@/types/game';

interface GameCanvasProps {
  mapData: TileId[][];
  timeLimit: number;
}

export default function GameCanvas({ mapData, timeLimit }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null); // DOM用
  const phaserRef = useRef<Phaser.Game | null>(null); // Phaserインスタンス保持用

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      physics: { 
        default: 'arcade',
        arcade: { debug: true } // 当たり判定表示
      },
    };

    const game = new Phaser.Game(config);
    game.scene.add('MainScene', MainScene);
    game.scene.start('MainScene', { 
      mapData: { tiles: mapData }, 
      timeLimit: timeLimit 
    });

    phaserRef.current = game;

    return () => {
      if (phaserRef.current) {
        phaserRef.current.destroy(true);
        phaserRef.current = null;
      }
    };
  }, [mapData, timeLimit]);

  return <div ref={containerRef} className="border-4 border-gray-700 rounded-lg overflow-hidden" />;
}