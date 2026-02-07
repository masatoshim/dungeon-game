"use client";

import { useState, useEffect, useCallback } from "react";
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
  // 初期値をその場で生成する
  const [tiles, setTiles] = useState<string[][]>(() => {
    return Array(10)
      .fill(0)
      .map((_, r) =>
        Array(15)
          .fill(0)
          .map((_, c) => (r === 0 || r === 9 || c === 0 || c === 14 ? "W" : "..")),
      );
  });
  const [selectedTile, setSelectedTile] = useState("W");
  const [entities, setEntities] = useState<EntityData[]>([]);

  const handleConfigChange = (key: string, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!config.name) return alert("ダンジョン名を入力してください");

    const payload = {
      ...config,
      status,
      mapData: {
        tiles,
        entities,
        width: cols,
        height: rows,
      },
    };

    try {
      const res = await fetch("/api/dungeons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(status === "PUBLISHED" ? "公開されました！" : "下書き保存しました");
        router.push("/"); // トップへ戻る
      }
    } catch (_error) {
      alert("保存に失敗しました");
      console.error(_error);
    }
  };

  // マップサイズ更新ロジック
  const updateTilesSize = useCallback((newRows: number, newCols: number) => {
    setTiles((prev) => {
      const newTiles = Array(newRows)
        .fill(0)
        .map((_, r) => {
          return Array(newCols)
            .fill(0)
            .map((_, c) => {
              // 外周判定（これが最優先）
              const isEdge = r === 0 || r === newRows - 1 || c === 0 || c === newCols - 1;
              if (isEdge) return "W";

              // 既存データ（prev）がある場合
              if (prev && prev[r] && prev[r][c] !== undefined) {
                // 古い外壁だった場所が内側に入った場合は床にする
                const isOldEdge = r === 0 || r === prev.length - 1 || c === 0 || c === prev[0].length - 1;
                return isOldEdge ? ".." : prev[r][c];
              }

              // それ以外（新規領域の内側）は床
              return "..";
            });
        });
      return newTiles;
    });
  }, []);

  useEffect(() => {
    updateTilesSize(rows, cols);
  }, [rows, cols, updateTilesSize]);

  const handleCellClick = (r: number, c: number) => {
    if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) return;
    const newTiles = [...tiles];
    newTiles[r] = [...newTiles[r]];
    newTiles[r][c] = selectedTile;
    setTiles(newTiles);

    const config = TILE_CONFIG[selectedTile as TileConfigKey];
    if (config && config.category === "GIMMICK") {
      setEntities([
        ...entities,
        {
          id: crypto.randomUUID(),
          type: selectedTile.startsWith("B") ? "BUTTON" : "DOOR",
          x: c,
          y: r,
          properties: { tileId: selectedTile },
        },
      ]);
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
            const clampedR = Math.max(4, Math.min(256, r));
            const clampedC = Math.max(4, Math.min(256, c));
            setRows(clampedR);
            setCols(clampedC);
            updateTilesSize(clampedR, clampedC);
          }}
          onSave={handleSave}
        />

        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0 space-y-4">
            <TilePalette selectedTile={selectedTile} onSelect={setSelectedTile} />

            {/* EntityList（ここも分割可能） */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h2 className="text-xs font-bold text-gray-500 mb-2 uppercase">Entities</h2>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {entities.map((e) => (
                  <div key={e.id} className="text-[10px] bg-gray-800 p-1 rounded flex justify-between">
                    <span>
                      {e.type} ({e.x},{e.y})
                    </span>
                    <button
                      onClick={() => setEntities(entities.filter((it) => it.id !== e.id))}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative">
            <div className="overflow-auto max-h-[75vh] p-12 bg-[linear-gradient(45deg,#151515_25%,transparent_25%,transparent_75%,#151515_75%,#151515),linear-gradient(45deg,#151515_25%,transparent_25%,transparent_75%,#151515_75%,#151515)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
              <div
                className="inline-grid gap-0 shadow-2xl ring-4 ring-black"
                style={{ gridTemplateColumns: `repeat(${cols}, 32px)` }}
              >
                {tiles.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      onMouseDown={() => handleCellClick(r, c)}
                      onMouseEnter={(e) => e.buttons === 1 && handleCellClick(r, c)}
                      className="w-8 h-8 border-[0.1px] border-white/5 box-border"
                    >
                      <TileIconForm tileId={cell} size={32} />
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
