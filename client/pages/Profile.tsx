import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getUserTotals } from "@/lib/user-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { authState } = useAuth();
  const [totals, setTotals] = useState<{
    gamesPlayed: number;
    totalScore: number;
    bestStreak: number;
  } | null>(null);

  useEffect(() => {
    if (authState.user) {
      getUserTotals(authState.user.id)
        .then(setTotals)
        .catch(() =>
          setTotals({ gamesPlayed: 0, totalScore: 0, bestStreak: 0 }),
        );
    }
  }, [authState.user?.id]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Your account and game stats</p>
        </div>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">
                {authState.user?.username || "Player"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">
                {authState.user?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {authState.user
                  ? new Date(authState.user.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Game Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md border bg-background/50">
              <div className="text-xs text-muted-foreground">Games Played</div>
              <div className="text-2xl font-bold">
                {totals?.gamesPlayed ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-md border bg-background/50">
              <div className="text-xs text-muted-foreground">Total Score</div>
              <div className="text-2xl font-bold">
                {totals?.totalScore ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-md border bg-background/50">
              <div className="text-xs text-muted-foreground">Best Streak</div>
              <div className="text-2xl font-bold">
                {totals?.bestStreak ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
