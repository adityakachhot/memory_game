import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Layers,
  Target,
  Clock,
  Zap,
  Palette,
} from "lucide-react";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collectionGroup, getDocs, limit, orderBy, query, where, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { GameId } from "@/lib/user-stats";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  streak?: number;
  avatar: string;
  isCurrentUser?: boolean;
}

const cardFlipLeaderboard: LeaderboardEntry[] = [];

const cupGameLeaderboard: LeaderboardEntry[] = [];

const simonSaysLeaderboard: LeaderboardEntry[] = [];

const achievements = [
  {
    name: "First Win",
    description: "Win your first game",
    icon: "🎉",
    unlocked: true,
  },
  {
    name: "Speed Demon",
    description: "Complete Card Flip in under 1 minute",
    icon: "⚡",
    unlocked: false,
  },
  {
    name: "Perfect Memory",
    description: "Complete Card Flip without mistakes",
    icon: "🧠",
    unlocked: true,
  },
  {
    name: "Lucky Streak",
    description: "Get 10 correct guesses in Cup Game",
    icon: "🍀",
    unlocked: true,
  },
  {
    name: "Eagle Eye",
    description: "Track the ball through 20+ shuffles",
    icon: "👁️",
    unlocked: false,
  },
  {
    name: "Dedication",
    description: "Play 100 games",
    icon: "💪",
    unlocked: false,
  },
];

function useLeaderboard(gameId: GameId) {
  const { authState } = useAuth();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function run() {
      try {
        const cg = collectionGroup(db, "stats");
        const q = query(cg, where("gameId", "==", gameId), orderBy("totalScore", "desc"), limit(20));
        const snap = await getDocs(q);
        const base: { uid: string; score: number; streak?: number }[] = [];
        snap.forEach((d) => {
          const parent = d.ref.parent.parent; // users/{uid}
          const uid = parent ? parent.id : "";
          const data = d.data() as any;
          base.push({ uid, score: data.totalScore || 0, streak: data.bestStreak || 0 });
        });
        const result: LeaderboardEntry[] = [];
        for (let i = 0; i < base.length; i++) {
          const e = base[i];
          let name = "Player";
          try {
            if (e.uid) {
              const uref = doc(db, "users", e.uid);
              const u = await getDoc(uref);
              const ud = u.exists() ? (u.data() as any) : null;
              name = ud?.username || ud?.email?.split("@")[0] || name;
            }
          } catch {}
          result.push({
            rank: i + 1,
            name,
            score: e.score,
            streak: e.streak,
            avatar: name.slice(0, 1).toUpperCase(),
            isCurrentUser: !!authState.user && e.uid === authState.user.id,
          });
        }
        setRows(result);
      } catch (e) {
        setRows([]);
      }
    }
    run();
  }, [gameId, authState.user?.id]);

  return rows;
}

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState("all-time");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-muted-foreground font-semibold">#{rank}</span>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-orange-500/20 border-amber-600/30";
      default:
        return "from-card/50 to-card/20 border-border";
    }
  };

  const LeaderboardTable = ({ data }: { data: LeaderboardEntry[] }) => (
    <div className="space-y-3">
      {data.map((entry) => (
        <Card
          key={entry.rank}
          className={cn(
            "transition-all duration-200 hover:scale-[1.02]",
            entry.isCurrentUser
              ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/50 ring-1 ring-primary/30"
              : `bg-gradient-to-r ${getRankColor(entry.rank)}`,
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 min-w-[3rem]">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="text-2xl">{entry.avatar}</div>

                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-semibold",
                        entry.isCurrentUser
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {entry.name}
                    </p>
                    {entry.isCurrentUser && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary/20 text-primary border-primary/30"
                      >
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {entry.score.toLocaleString()} pts
                    </div>
                    {typeof entry.streak === "number" && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {entry.streak} streak
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {entry.rank <= 3 && (
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-bold",
                      entry.rank === 1 &&
                        "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                      entry.rank === 2 &&
                        "bg-gray-400/20 text-gray-300 border-gray-400/30",
                      entry.rank === 3 &&
                        "bg-amber-600/20 text-amber-300 border-amber-600/30",
                    )}
                  >
                    {entry.rank === 1
                      ? "CHAMPION"
                      : entry.rank === 2
                        ? "RUNNER-UP"
                        : "3RD PLACE"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank against other memory masters
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center gap-2">
          {["all-time", "monthly", "weekly"].map((filter) => (
            <Button
              key={filter}
              variant={timeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeFilter(filter)}
              className="capitalize"
            >
              {filter.replace("-", " ")}
            </Button>
          ))}
        </div>

        <Tabs defaultValue="card-flip" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="card-flip" className="gap-2">
              <Layers className="h-4 w-4" />
              Card Flip
            </TabsTrigger>
            <TabsTrigger value="cup-game" className="gap-2">
              <Trophy className="h-4 w-4" />
              Cup Game
            </TabsTrigger>
            <TabsTrigger value="simon-says" className="gap-2">
              <Palette className="h-4 w-4" />
              Simon Says
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Star className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card-flip" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Card Flip Memory - Top Players
                </CardTitle>
                <CardDescription>
                  Rankings based on highest scores in the card matching game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable data={cardFlipLeaderboard} gameType="card" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cup-game" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Guess the Cup - Top Players
                </CardTitle>
                <CardDescription>
                  Rankings based on highest scores and longest streaks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable data={cupGameLeaderboard} gameType="cup" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="simon-says" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Simon Says - Top Players
                </CardTitle>
                <CardDescription>
                  Rankings based on longest sequences and highest scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardTable data={simonSaysLeaderboard} gameType="cup" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Unlock achievements by reaching milestones and completing
                  challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.name}
                      className={cn(
                        "transition-all duration-200",
                        achievement.unlocked
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
                          : "bg-card/30 border-border opacity-60",
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {achievement.name}
                              </h3>
                              {achievement.unlocked && (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/20 text-green-400 border-green-500/30"
                                >
                                  Unlocked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
