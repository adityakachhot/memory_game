import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Trophy, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import {
  subscribeToMatch,
  updatePlayerScore,
  completeMatch,
  updateMatchState,
  cancelMatch,
  type Match,
} from "@/lib/matchmaking";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import CardFlipGame from "@/pages/CardFlipGame";
import GuessCupGame from "@/pages/GuessCupGame";
import SimonSaysGame from "@/pages/SimonSaysGame";
import WordBuilderGame from "@/pages/WordBuilderGame";
import PicturePuzzleGame from "@/pages/PicturePuzzleGame";

const gameComponents: Record<string, any> = {
  "card-flip": CardFlipGame,
  "guess-cup": GuessCupGame,
  "simon-says": SimonSaysGame,
  "word-builder": WordBuilderGame,
  "picture-puzzle": PicturePuzzleGame,
};

interface PVPGameProps {
  onGameComplete?: (score: number) => void;
}

export default function PVPGameContainer({ onGameComplete }: PVPGameProps) {
  const { gameId, matchId } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerNum, setPlayerNum] = useState<1 | 2 | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameState, setGameState] = useState<any | null>(null);
  const isLeavingRef = useRef(false);
  const matchRef = useRef<Match | null>(null);
  const isMountedRef = useRef(true);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Determine which player this user is and subscribe to match updates
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = subscribeToMatch(matchId, (matchData) => {
      if (!isMountedRef.current) return; // Don't update if component unmounted

      if (!matchData) {
        // Match was deleted - opponent left
        setLoading(false);
        // Only navigate if we had a match before and it wasn't completed
        const currentMatch = matchRef.current;
        if (currentMatch && currentMatch.player2 && !gameCompleted && currentMatch.status !== "completed") {
          // Small delay to ensure it's not just a loading state
          setTimeout(() => {
            if (!isMountedRef.current || isLeavingRef.current) return; // Don't navigate if we're already leaving or unmounted
            navigate("/pvp");
          }, 1000);
        }
        return;
      }

      // Check if match status changed to completed
      if (matchData.status === "completed" && !gameCompleted) {
        setGameCompleted(true);
        return;
      }

      // Update match ref
      matchRef.current = matchData;
      setMatch(matchData);
      setGameState(matchData.gameState || null);
      setLoading(false);

      if (authState.user) {
        if (matchData.player1.uid === authState.user.id) {
          setPlayerNum(1);
          if (matchData.player2) {
            setOpponentScore(matchData.player2.score);
          }
        } else if (matchData.player2?.uid === authState.user.id) {
          setPlayerNum(2);
          setOpponentScore(matchData.player1.score);
        }
      }
    });

    return () => unsubscribe();
  }, [matchId, authState.user?.id, gameCompleted, navigate]);

  // Handle player exit - cancel match ONLY when component unmounts or page closes
  useEffect(() => {
    if (!matchId) return;
    
    const handleBeforeUnload = () => {
      // Cancel match when page is closing
      isLeavingRef.current = true;
      const currentMatch = matchRef.current;
      if (currentMatch && currentMatch.player2 && currentMatch.status !== "completed") {
        cancelMatch(matchId).catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // This cleanup ONLY runs when component unmounts, not on re-renders
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Only cancel if we're intentionally leaving (back button clicked) or page is closing
      // Check mount status to ensure we're actually unmounting
      if (isLeavingRef.current) {
        const currentMatch = matchRef.current;
        if (currentMatch && currentMatch.player2 && currentMatch.status !== "completed") {
          // Small delay to ensure this is real unmount, not just state update
          setTimeout(() => {
            if (!isMountedRef.current) {
              cancelMatch(matchId).catch(() => {});
            }
          }, 200);
        }
      }
    };
    // Empty dependency array - this effect only runs on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize shared game state for Card Flip once both players are present
  useEffect(() => {
    if (!match || !match.player1 || !match.player2) return;
    if (!gameState || !gameState.cards) {
      // Build identical deck for both players and set first turn to player1
      const pairs = 6; // Easy for PVP demo
      const symbols = ["🎯","🎮","🎲","🎪","🎨","🎭","🎸","🎺","🎷","🎻","🎹","🎼"].slice(0, pairs);
      const deck = [...symbols, ...symbols]
        .map((value, index) => ({ id: index, value, isFlipped: false, isMatched: false }))
        .sort(() => Math.random() - 0.5);

      updateMatchState(matchId!, {
        game: "card-flip",
        cards: deck,
        activePlayerUid: match.player1.uid,
        turnNumber: 1,
        lastFlip: [],
      }).catch(() => {});
    }
  }, [match, gameState, matchId]);

  const isMyTurn = !!(authState.user && gameState?.activePlayerUid === authState.user.id);

  // Handle a flip request from CardFlipGame (multiplayer)
  const handleFlipRequest = async (cardId: number) => {
    if (!matchId || !gameState || !authState.user) return;
    if (!isMyTurn) return;
    const cards = [...gameState.cards];
    const card = cards.find((c: any) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Flip the card and broadcast immediately so both clients see it
    card.isFlipped = true;
    const currentFlips: number[] = [...(gameState.lastFlip || []), cardId];
    await updateMatchState(matchId, {
      ...gameState,
      cards,
      lastFlip: currentFlips,
    }).catch(() => {});

    // If two cards are flipped, resolve the turn
    if (currentFlips.length === 2) {
      // Delay resolution slightly so the second flip is visible
      setTimeout(async () => {
        const [a, b] = currentFlips;
        const ca = cards.find((c: any) => c.id === a);
        const cb = cards.find((c: any) => c.id === b);
        const isMatch = ca && cb && ca.value === cb.value;

        if (isMatch) {
          ca!.isMatched = true;
          cb!.isMatched = true;
          // Award point to current player and keep their turn
          const playerNum = match!.player1.uid === authState.user.id ? 1 : 2;
          const newScore = (playerNum === 1 ? match!.player1.score : match!.player2!.score) + 1;
          await updatePlayerScore(matchId, playerNum, newScore, false).catch(() => {});
          
          // Check if all pairs are matched
          const allMatched = cards.filter((c: any) => c.isMatched).length === cards.length;
          
          if (allMatched) {
            // Game complete - wait a moment for score to update, then determine winner
            setTimeout(async () => {
              const matchDoc = await getDoc(doc(db, "matches", matchId));
              if (!matchDoc.exists()) return;
              const matchData = matchDoc.data() as Match;
              const p1Score = matchData.player1.score;
              const p2Score = matchData.player2?.score || 0;
              const winnerUid = p1Score > p2Score ? matchData.player1.uid : (p2Score > p1Score ? matchData.player2!.uid : undefined);
              
              await completeMatch(matchId, winnerUid).catch(() => {});
              setGameCompleted(true);
              setTimeout(() => {
                navigate(`/pvp/results/${matchId}`);
              }, 2000);
            }, 300);
          } else {
            // Keep same player's turn after a match
            await updateMatchState(matchId, {
              ...gameState,
              cards,
              lastFlip: [],
            }).catch(() => {});
          }
        } else {
          // No match - unflip both and switch turn
          ca!.isFlipped = false;
          cb!.isFlipped = false;
          
          const nextUid = match!.player1.uid === gameState.activePlayerUid ? match!.player2!.uid : match!.player1.uid;
          await updateMatchState(matchId, {
            ...gameState,
            cards,
            activePlayerUid: nextUid,
            turnNumber: (gameState.turnNumber || 1) + 1,
            lastFlip: [],
          }).catch(() => {});
        }
      }, 350);
    } else {
      // Only first flip this turn
      await updateMatchState(matchId, {
        ...gameState,
        cards,
        lastFlip: currentFlips,
      }).catch(() => {});
    }
  };

  const handleGameComplete = async (score: number) => {
    // Game completion is now handled in handleFlipRequest when all pairs are matched
    // This is kept for compatibility with other game types
    if (!matchId || !playerNum || gameId !== "card-flip") return;
    onGameComplete?.(score);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <Loader className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading match...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!match || !gameId || !playerNum) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <Card className="bg-card/50 max-w-md">
            <CardHeader>
              <CardTitle>Match Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The match could not be loaded. It may have expired.
              </p>
              <Button onClick={() => navigate("/pvp")} className="w-full">
                Back to PVP
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const GameComponent = gameComponents[gameId];
  const currentPlayer = playerNum === 1 ? match.player1 : match.player2;
  const opponent = playerNum === 1 ? match.player2 : match.player1;

  if (!GameComponent) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <Card className="bg-card/50 max-w-md">
            <CardHeader>
              <CardTitle>Game Not Found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The game could not be loaded.
              </p>
              <Button onClick={() => navigate("/pvp")} className="w-full">
                Back to PVP
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 px-2 md:px-0">
        {/* Match Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
          <Button
            variant="ghost"
            onClick={async () => {
              // Mark that we're intentionally leaving
              isLeavingRef.current = true;
              // Only cancel if match is in progress with both players
              if (matchId && match && match.player2 && match.status !== "completed" && !gameCompleted) {
                await cancelMatch(matchId).catch(() => {});
              }
              navigate("/pvp");
            }}
            className="gap-2 text-sm md:text-base"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to PVP</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-center">
            {/* Player 1 Score */}
            <Card
              className={cn(
                "flex-1 md:flex-none",
                currentPlayer === match.player1
                  ? "border-primary/50 bg-primary/10"
                  : ""
              )}
            >
              <CardContent className="p-2 md:p-3">
                <div className="text-xs md:text-sm text-muted-foreground truncate">
                  <span className="hidden sm:inline">{match.player1.username}</span>
                  <span className="sm:hidden">{match.player1.username.slice(0, 8)}</span>
                  {currentPlayer === match.player1 && (
                    <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-base md:text-lg font-bold text-primary">
                  {match.player1.score}
                </div>
              </CardContent>
            </Card>

            <div className="text-lg md:text-2xl font-bold text-muted-foreground">VS</div>

            {/* Player 2 Score */}
            <Card
              className={cn(
                "flex-1 md:flex-none",
                currentPlayer === match.player2
                  ? "border-primary/50 bg-primary/10"
                  : ""
              )}
            >
              <CardContent className="p-2 md:p-3">
                <div className="text-xs md:text-sm text-muted-foreground truncate">
                  {match.player2 ? (
                    <>
                      <span className="hidden sm:inline">{match.player2.username}</span>
                      <span className="sm:hidden">{match.player2.username.slice(0, 8)}</span>
                    </>
                  ) : (
                    "Waiting..."
                  )}
                  {currentPlayer === match.player2 && (
                    <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="text-base md:text-lg font-bold text-primary">
                  {match.player2?.score || 0}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Turn Indicator */}
        {gameId === "card-flip" && match.player2 && !gameCompleted && (
          <div className="text-center">
            <Badge
              variant={isMyTurn ? "default" : "secondary"}
              className={cn(
                "text-sm md:text-lg px-3 md:px-4 py-1.5 md:py-2",
                isMyTurn && "bg-primary text-primary-foreground animate-pulse"
              )}
            >
              {isMyTurn ? "Your Turn" : `${opponent?.username?.slice(0, 10) || "Opponent"}'s Turn`}
            </Badge>
          </div>
        )}

        {/* Game Area */}
        <div className="relative">
          {!match.player2 && !gameCompleted && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-2">
                <Loader className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-muted-foreground">Waiting for opponent...</p>
              </div>
            </div>
          )}

          {gameCompleted && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-3">
                <Trophy className="h-12 w-12 text-primary mx-auto" />
                <p className="font-semibold">Game Complete!</p>
                <p className="text-sm text-muted-foreground">
                  Showing results...
                </p>
              </div>
            </div>
          )}

          <GameComponent
            multiplayerMode={true}
            onGameComplete={handleGameComplete}
            controlledCards={gameState?.cards || []}
            onRequestFlip={handleFlipRequest}
            isMyTurn={isMyTurn}
          />
        </div>
      </div>
    </Layout>
  );
}
