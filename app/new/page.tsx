"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TILE_CONFIG, EntityData, TileConfigKey } from "@/types";
import { TileIconForm } from "@/components/TileIconForm";
import { EditorHeader } from "@/components/EditorHeader";
import { TilePalette } from "@/components/TilePalette";

export default function NewDungeonPage() {
  const router = useRouter();
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [config, setConfig] = useState({
    name: "",
    description: "",
    timeLimit: 60,
  });

  // 初期タイルを rows/cols と一致させる
  const [tiles, setTiles] = useState<string[][]>(() => {
    return Array(10)
      .fill(0)
      .map((_, r) =>
        Array(10)
          .fill(0)
          .map((_, c) => (r === 0 || r === 9 || c === 0 || c === 9 ? "W" : "..")),
      );
  });

  const [selectedTile, setSelectedTile] = useState("W");
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [linkingEntityId, setLinkingEntityId] = useState<string | null>(null);

  // --- ヘルパー関数 ---
  const handleConfigChange = (key: string, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // タイルサイズ変更（EditorHeaderから呼ばれる）
  const updateTilesSize = (rawRows: number, rawCols: number) => {
    // 空文字（NaN）や4未満をガードし、確定後の値を算出
    const newRows = Math.max(4, rawRows || 4);
    const newCols = Math.max(4, rawCols || 4);

    // ステートを更新（入力欄の表示用）
    setRows(newRows);
    setCols(newCols);

    // 算出した確定値（newRows/newCols）を使ってタイルを生成
    setTiles((prev) => {
      return Array(newRows)
        .fill(0)
        .map((_, r) =>
          Array(newCols)
            .fill(0)
            .map((_, c) => {
              // 外周（壁）の判定
              const isEdge = r === 0 || r === newRows - 1 || c === 0 || c === newCols - 1;
              if (isEdge) return "W";

              // 既存タイルのコピー（旧外周は床に戻す）
              if (prev[r] && prev[r][c] !== undefined) {
                const isOldEdge = r === 0 || r === prev.length - 1 || c === 0 || c === prev[0].length - 1;
                return isOldEdge ? ".." : prev[r][c];
              }
              return "..";
            }),
        );
    });

    // はみ出したエンティティ（鍵・扉）を削除
    // サイズを小さくした時に、存在しない座標にエンティティが残るのを防ぐ
    setEntities((prev) => prev.filter((e) => e.x < newCols - 1 && e.y < newRows - 1));
  };

  // --- メインロジック ---
  const handleCellClick = useCallback(
    (r: number, c: number) => {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) return;

      const tileConfig = TILE_CONFIG[selectedTile as TileConfigKey];
      const isGimmick = tileConfig?.category === "GIMMICK";

      // タイルを更新
      setTiles((prev) => {
        const next = [...prev];
        next[r] = [...next[r]];
        next[r][c] = isGimmick ? ".." : selectedTile;
        return next;
      });

      // エンティティを更新
      setEntities((prev) => {
        const filtered = prev.filter((e) => !(e.x === c && e.y === r));
        if (isGimmick) {
          return [
            ...filtered,
            {
              id: `${selectedTile}_${crypto.randomUUID().slice(0, 8)}`,
              type: selectedTile === "K1" ? "KEY" : "DOOR",
              x: c,
              y: r,
              properties: { tileId: selectedTile },
            },
          ];
        }
        return filtered;
      });
    },
    [rows, cols, selectedTile],
  );

  const handleEntityLink = (entityId: string) => {
    if (!linkingEntityId) {
      setLinkingEntityId(entityId);
    } else {
      if (linkingEntityId === entityId) {
        setLinkingEntityId(null);
        return;
      }
      setEntities((prev) => {
        const source = prev.find((e) => e.id === linkingEntityId);
        const target = prev.find((e) => e.id === entityId);
        if (!source || !target) return prev;
        return prev.map((e) => {
          if (e.id === source.id) return { ...e, properties: { ...e.properties, targetId: target.id } };
          if (e.id === target.id) return { ...e, properties: { ...e.properties, targetId: source.id } };
          return e;
        });
      });
      setLinkingEntityId(null);
      alert("接続完了");
    }
  };

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!config.name) return alert("ダンジョン名を入力してください");
    const normalizedTiles = tiles.map((row) => row.map((cell) => (cell === ".." ? " " : cell)));
    const payload = {
      ...config,
      status,
      mapData: { tiles: normalizedTiles, entities, width: cols, height: rows },
    };
    try {
      const res = await fetch("/api/dungeons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/");
    } catch (e) {
      alert("失敗");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <EditorHeader
          cols={cols}
          rows={rows}
          config={config}
          onConfigChange={handleConfigChange}
          onSizeChange={(r, c) => {
            setRows(r);
            setCols(c);
            updateTilesSize(r, c);
          }}
          onSave={handleSave}
        />

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0 space-y-4">
            <TilePalette selectedTile={selectedTile} onSelect={setSelectedTile} />
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase flex justify-between">
                <span>Entities</span>
                {linkingEntityId && <span className="text-yellow-500 animate-pulse">Linking...</span>}
              </h2>
              <div className="max-h-60 overflow-y-auto space-y-2 text-sm">
                {entities.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => handleEntityLink(e.id)}
                    className={`p-2 rounded cursor-pointer border ${linkingEntityId === e.id ? "border-yellow-500 bg-yellow-500/10" : "border-gray-800 bg-gray-800/50"}`}
                  >
                    {e.type} ({e.x}, {e.y}) {e.properties?.targetId && "🔗"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-auto p-12">
            <div
              className="inline-grid gap-0 shadow-2xl ring-4 ring-black"
              style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}
            >
              {tiles.map((row, r) =>
                row.map((cell, c) => {
                  const entityAtPos = entities.find((e) => e.x === c && e.y === r);
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseDown={() => handleCellClick(r, c)}
                      onMouseEnter={(e) => e.buttons === 1 && handleCellClick(r, c)}
                      className="w-8 h-8 border-[0.1px] border-white/5 relative box-border transition-colors hover:bg-white/10"
                    >
                      <TileIconForm tileId={cell} size={32} />
                      {entityAtPos && (
                        <div className="absolute inset-0 pointer-events-none">
                          <TileIconForm tileId={entityAtPos.properties?.tileId || ""} size={32} />
                        </div>
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
