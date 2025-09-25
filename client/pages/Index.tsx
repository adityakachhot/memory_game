import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trophy, Brain, Palette, Type } from "lucide-react";
import Layout from "@/components/Layout";
import ThemeToggle from "@/components/ThemeToggle";

const games = [
  {
    id: "card-flip",
    title: "Card Flip Memory",
    description:
      "Match pairs of cards by flipping them over. Test your memory with increasing difficulty levels.",
    icon: Layers,
    difficulty: "Easy",
    color: "from-purple-600/20 to-purple-800/20",
    borderColor: "border-purple-500/30",
    href: "/game/card-flip",
  },
  {
    id: "guess-cup",
    title: "Guess the Cup",
    description:
      "Watch the ball hide under a cup, then track it as cups shuffle. Can you find the ball?",
    icon: Trophy,
    difficulty: "Medium",
    color: "from-orange-600/20 to-orange-800/20",
    borderColor: "border-orange-500/30",
    href: "/game/guess-cup",
  },
  {
    id: "simon-says",
    title: "Simon Says",
    description:
      "Watch the color sequence flash, then repeat it perfectly. Each round adds a new color to remember!",
    icon: Palette,
    difficulty: "Hard",
    color: "from-blue-600/20 to-indigo-800/20",
    borderColor: "border-blue-500/30",
    href: "/game/simon-says",
  },
  {
    id: "word-builder",
    title: "Word Builder",
    description:
      "Unscramble the letters to form a word. New letters every round with adaptive challenge.",
    icon: Type,
    difficulty: "Adaptive",
    color: "from-emerald-600/20 to-teal-800/20",
    borderColor: "border-emerald-500/30",
    href: "/game/word-builder",
  },
];

export default function Index() {
  return (
    <Layout>
      <div className="space-y-8 overflow-hidden">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-float animate-glow">
            Memory Master
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animation-delay-300 animate-fade-in-up">
            Challenge your mind with our collection of memory games. Train your
            brain, improve your focus, and compete with others.
          </p>
        </div>

        {/* Game Selection */}
        <section className="space-y-6">
          <div className="text-center animate-fade-in-up animation-delay-900">
            <h2 className="text-3xl font-bold text-foreground mb-2 hover:scale-105 transition-transform duration-300">
              Choose Your Game
            </h2>
            <p className="text-muted-foreground">
              Select a memory game to start training your brain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className={`game-card group cursor-pointer overflow-hidden bg-gradient-to-br ${game.color} border-2 ${game.borderColor} transition-all duration-700 hover:scale-105 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/30 animate-fade-in-up hover:border-primary/50 transform-gpu`}
                  style={{ animationDelay: `${1100 + index * 200}ms` }}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="game-icon p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 animate-pulse-slow">
                        <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-secondary/80 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110"
                      >
                        {game.difficulty}
                      </Badge>
                    </div>
                    <div className="transform transition-transform duration-300 group-hover:translate-x-1">
                      <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                        {game.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                        {game.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to={game.href}>
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg transform-gpu">
                        <span className="group-hover:animate-pulse">
                          Play Now
                        </span>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-4 py-8 animate-fade-in-up animation-delay-1200">
          <h3 className="text-2xl font-bold text-foreground hover:scale-105 transition-transform duration-300">
            Ready to Challenge Yourself?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start with any game and work your way up the leaderboard. Each game
            is designed to improve different aspects of your memory.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/leaderboard">
              <Button
                variant="outline"
                className="cta-button gap-2 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:bg-primary/10 hover:border-primary/50 animate-glow"
              >
                <Trophy className="h-4 w-4 transition-transform group-hover:rotate-12" />
                View Leaderboard
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant="outline"
                className="cta-button gap-2 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:bg-primary/10 hover:border-primary/50"
              >
                <Brain className="h-4 w-4 transition-transform group-hover:bounce" />
                Game Settings
              </Button>
            </Link>
          </div>
        </section>

        {/* Floating Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-float"
            style={{ animationDelay: "0s", animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-40 right-20 w-3 h-3 bg-accent/20 rounded-full animate-float"
            style={{ animationDelay: "2s", animationDuration: "8s" }}
          ></div>
          <div
            className="absolute bottom-40 left-20 w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{ animationDelay: "4s", animationDuration: "7s" }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-4 h-4 bg-accent/10 rounded-full animate-float"
            style={{ animationDelay: "1s", animationDuration: "5s" }}
          ></div>
        </div>
      </div>
    </Layout>
  );
}
