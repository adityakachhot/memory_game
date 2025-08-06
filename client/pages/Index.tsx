import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Layers, Trophy, Brain, Palette } from "lucide-react";
import Layout from "@/components/Layout";
import anime from "animejs";

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
  },
  {
    id: "simon-says",
    title: "Simon Says",
    description: "Watch the color sequence flash, then repeat it perfectly. Each round adds a new color to remember!",
    icon: Palette,
    difficulty: "Hard",
    color: "from-blue-600/20 to-indigo-800/20", 
    borderColor: "border-blue-500/30",
    href: "/game/simon-says"
  }
];

const stats = [
  { label: "Games Played", value: "24", icon: Brain },
  { label: "Best Streak", value: "8", icon: Sparkles },
  { label: "Total Score", value: "1,340", icon: Trophy },
];

export default function Index() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial states for animations
    if (heroRef.current) {
      anime.set(heroRef.current.querySelectorAll('h1, p'), {
        translateY: 50,
        opacity: 0
      });
    }

    if (statsRef.current) {
      anime.set(statsRef.current.querySelectorAll('.stat-card'), {
        translateY: 30,
        opacity: 0,
        scale: 0.8
      });
    }

    if (gamesRef.current) {
      anime.set(gamesRef.current.querySelectorAll('.game-card'), {
        translateY: 50,
        opacity: 0,
        scale: 0.9,
        rotateX: -10
      });
    }

    if (ctaRef.current) {
      anime.set(ctaRef.current.querySelectorAll('h3, p, .cta-button'), {
        translateY: 30,
        opacity: 0
      });
    }

    // Start entrance animations
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      duration: 1000
    });

    // Hero section animation
    timeline.add({
      targets: heroRef.current?.querySelector('h1'),
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1200,
      easing: 'easeOutBack'
    }).add({
      targets: heroRef.current?.querySelector('p'),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 800,
      offset: '-=800'
    });

    // Stats cards staggered animation
    timeline.add({
      targets: statsRef.current?.querySelectorAll('.stat-card'),
      translateY: [30, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 800,
      delay: anime.stagger(150),
      offset: '-=400'
    });

    // Game cards with advanced staggered animation
    timeline.add({
      targets: gamesRef.current?.querySelectorAll('.game-card'),
      translateY: [50, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      rotateX: [-10, 0],
      duration: 1000,
      delay: anime.stagger(200, {start: 300}),
      offset: '-=600'
    });

    // CTA section
    timeline.add({
      targets: ctaRef.current?.querySelectorAll('h3, p'),
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100),
      offset: '-=400'
    }).add({
      targets: ctaRef.current?.querySelectorAll('.cta-button'),
      translateY: [20, 0],
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 500,
      delay: anime.stagger(100),
      offset: '-=300'
    });

    // Add floating animation to hero elements
    anime({
      targets: heroRef.current?.querySelector('h1'),
      translateY: [-5, 5],
      duration: 3000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
      delay: 2000
    });

    // Sparkle animation for stats
    anime({
      targets: statsRef.current?.querySelectorAll('.stat-icon'),
      scale: [1, 1.1, 1],
      rotate: [0, 5, 0],
      duration: 2000,
      delay: anime.stagger(500, {start: 3000}),
      loop: true,
      direction: 'alternate',
      easing: 'easeInOutQuad'
    });

  }, []);

  const handleGameCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    anime({
      targets: e.currentTarget,
      scale: 1.05,
      translateY: -10,
      boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
      duration: 300,
      easing: 'easeOutQuad'
    });

    // Animate the icon
    anime({
      targets: e.currentTarget.querySelector('.game-icon'),
      rotate: 360,
      scale: [1, 1.2, 1],
      duration: 600,
      easing: 'easeOutBack'
    });
  };

  const handleGameCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    anime({
      targets: e.currentTarget,
      scale: 1,
      translateY: 0,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    anime({
      targets: e.currentTarget,
      scale: 1.05,
      duration: 200,
      easing: 'easeOutQuad'
    });
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    anime({
      targets: e.currentTarget,
      scale: 1,
      duration: 200,
      easing: 'easeOutQuad'
    });
  };

  return (
    <Layout>
      <div className="space-y-8 overflow-hidden">
        {/* Hero Section */}
        <div ref={heroRef} className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Memory Master
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Challenge your mind with our collection of memory games. Train your brain, improve your focus, and compete with others.
          </p>
        </div>

        {/* Stats Overview */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="stat-card bg-card/50 border-border cursor-pointer transition-all duration-300 hover:bg-card/70">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="stat-icon p-3 rounded-lg bg-primary/10">
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

          <div ref={gamesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className={`game-card group cursor-pointer overflow-hidden bg-gradient-to-br ${game.color} border-2 ${game.borderColor} transition-all duration-300`}
                  onMouseEnter={handleGameCardHover}
                  onMouseLeave={handleGameCardLeave}
                >
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="game-icon p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
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
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onMouseEnter={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                      >
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
        <section ref={ctaRef} className="text-center space-y-4 py-8">
          <h3 className="text-2xl font-bold text-foreground">Ready to Challenge Yourself?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start with any game and work your way up the leaderboard. Each game is designed to improve different aspects of your memory.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/leaderboard">
              <Button 
                variant="outline" 
                className="cta-button gap-2"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant="outline" 
                className="cta-button gap-2"
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
              >
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
