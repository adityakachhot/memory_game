import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Layers, Trophy, Brain } from "lucide-react";
import Layout from "@/components/Layout";

const games = [
  {
    id: "card-flip",
    title: "Card Flip Memory",
    description: "Match pairs of cards by flipping them over. Test your memory with increasing difficulty levels.",
    icon: Layers,
    difficulty: "Easy",
    color: "from-purple-600/20 to-purple-800/20",
    borderColor: "border-purple-500/30",
    href: "/game/card-flip"
  },
  {
    id: "guess-cup",
    title: "Guess the Cup",
    description: "Watch the ball hide under a cup, then track it as cups shuffle. Can you find the ball?",
    icon: Trophy,
    difficulty: "Medium", 
    color: "from-orange-600/20 to-orange-800/20",
    borderColor: "border-orange-500/30",
    href: "/game/guess-cup"
  }
];

const stats = [
  { label: "Games Played", value: "24", icon: Brain },
  { label: "Best Streak", value: "8", icon: Sparkles },
  { label: "Total Score", value: "1,340", icon: Trophy },
];

export default function Index() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Memory Master
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge your mind with our collection of memory games. Train your brain, improve your focus, and compete with others.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card/50 border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Game Selection */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Game</h2>
            <p className="text-muted-foreground">Select a memory game to start training your brain</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className={`group hover:scale-105 transition-all duration-300 bg-gradient-to-br ${game.color} border-2 ${game.borderColor} hover:border-primary/50 cursor-pointer overflow-hidden`}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <Badge variant="secondary" className="bg-secondary/80">
                        {game.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2">
                        {game.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to={game.href}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Play Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 py-8">
          <h3 className="text-2xl font-bold text-foreground">Ready to Challenge Yourself?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start with any game and work your way up the leaderboard. Each game is designed to improve different aspects of your memory.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/leaderboard">
              <Button variant="outline" className="gap-2">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="gap-2">
                <Brain className="h-4 w-4" />
                Game Settings
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
