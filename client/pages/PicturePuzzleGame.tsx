import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Shuffle } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { logGamePlay, updateGameStats } from "@/lib/user-stats";

const IMAGES = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200&auto=format&fit=crop",
];

function makeShuffled(size: number): number[] {
  const arr = Array.from({ length: size * size }, (_, i) => i);
  // simple shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PicturePuzzleGame() {
  const [grid, setGrid] = useState(3);
  const [tiles, setTiles] = useState<number[]>(() => makeShuffled(3));
  const [round, setRound] = useState(1);
  const [moves, setMoves] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>(() => IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  const [selected, setSelected] = useState<number | null>(null);
  const { authState } = useAuth();

  const tileSize = useMemo(() => 100 / grid, [grid]);

  const isSolved = useMemo(() => tiles.every((v, i) => v === i), [tiles]);

  useEffect(() => {
    if (isSolved) {
      // update stats and advance round
      if (authState.isAuthenticated && authState.user) {
        updateGameStats(authState.user.id, "picture-puzzle" as any, {
          played: true,
          addScore: Math.max(10, 200 - moves * 2),
          streakCandidate: round,
        }).catch(() => {});
        logGamePlay(authState.user.id, "picture-puzzle" as any, {
          round,
          grid,
          moves,
          imageUrl,
        }).catch(() => {});
      }
      const nextGrid = grid < 5 ? grid + 1 : grid; // grow to 5x5 max
      const nextRound = round + 1;
      setTimeout(() => {
        setRound(nextRound);
        setGrid(nextGrid);
        setTiles(makeShuffled(nextGrid));
        setMoves(0);
        setSelected(null);
        setImageUrl(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
      }, 600);
    }
  }, [isSolved]);

  const resetGame = () => {
    setRound(1);
    setGrid(3);
    setTiles(makeShuffled(3));
    setMoves(0);
    setSelected(null);
    setImageUrl(IMAGES[Math.floor(Math.random() * IMAGES.length)]);
  };

  const shuffle = () => {
    setTiles((t) => makeShuffled(grid));
    setMoves(0);
    setSelected(null);
  };

  const handleClick = (idx: number) => {
    if (selected === null) {
      setSelected(idx);
      return;
    }
    if (selected === idx) {
      setSelected(null);
      return;
    }
    setTiles((arr) => {
      const copy = [...arr];
      [copy[selected], copy[idx]] = [copy[idx], copy[selected]];
      return copy;
    });
    setMoves((m) => m + 1);
    setSelected(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Picture Puzzle</h1>
          <Button variant="outline" size="sm" onClick={resetGame} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            New Game
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          <Card className="bg-card/50"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Round</div><div className="text-xl font-bold">{round}</div></CardContent></Card>
          <Card className="bg-card/50"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Grid</div><div className="text-xl font-bold">{grid}×{grid}</div></CardContent></Card>
          <Card className="bg-card/50"><CardContent className="p-4"><div className="text-xs text-muted-foreground">Moves</div><div className="text-xl font-bold">{moves}</div></CardContent></Card>
          <Card className="bg-card/50 md:col-span-3"><CardContent className="p-4 flex items-center gap-2"><Badge variant="secondary">Fluent transitions</Badge><Badge variant="secondary">Random image each round</Badge></CardContent></Card>
        </div>

        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Arrange the tiles</CardTitle>
              <Button variant="outline" size="sm" onClick={shuffle} className="gap-2">
                <Shuffle className="h-4 w-4" /> Shuffle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LayoutGroup>
              <div
                className="relative mx-auto"
                style={{ width: 360, height: 360 }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${grid}, 1fr)`,
                    gridTemplateRows: `repeat(${grid}, 1fr)`,
                    width: "100%",
                    height: "100%",
                    gap: 4,
                  }}
                >
                  {tiles.map((tile, idx) => {
                    const row = Math.floor(idx / grid);
                    const col = idx % grid;
                    const percent = 100;
                    const bgX = (tile % grid) * (percent / (grid - 1));
                    const bgY = Math.floor(tile / grid) * (percent / (grid - 1));
                    return (
                      <motion.button
                        key={tile + "-" + idx}
                        layout
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleClick(idx)}
                        className={`rounded-md border overflow-hidden focus:outline-none ${selected === idx ? "ring-2 ring-primary" : ""}`}
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: `${grid * 100}% ${grid * 100}%`,
                          backgroundPosition: `${bgX}% ${bgY}%`,
                          aspectRatio: "1 / 1",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </LayoutGroup>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
