
"use client";

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { leaderboard } from '@/lib/data.json';
import type { LeaderboardEntry } from '@/lib/data';
import { Trophy, Award, Medal, Flame } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


export default function LeaderboardPage() {
  const router = useRouter();

  const getRankIcon = (rank: number) => {
    const iconBaseClass = "w-6 h-6";
    if (rank === 1) return <Trophy className={cn(iconBaseClass, "text-yellow-400 rank-gold-glow")} />;
    if (rank === 2) return <Award className={cn(iconBaseClass, "text-slate-300 rank-silver-glow")} />;
    if (rank === 3) return <Medal className={cn(iconBaseClass, "text-amber-500 rank-bronze-glow")} />;
    return <span className="font-bold text-lg">{rank}</span>;
  }

  const calculateWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return '0%';
    return `${((wins / gamesPlayed) * 100).toFixed(0)}%`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                  Leaderboard
                </h1>
                <p className="text-lg text-muted-foreground mt-2">See who's dominating the arena.</p>
              </div>
              
              {/* Desktop View */}
              <div className="hidden md:block max-w-7xl mx-auto">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                                  <TableHead>Player</TableHead>
                                  <TableHead className="text-center">Games</TableHead>
                                  <TableHead className="text-center hidden lg:table-cell">Win Rate</TableHead>
                                  <TableHead className="text-center hidden lg:table-cell">Streak</TableHead>
                                  <TableHead className="hidden xl:table-cell">Last Tournament</TableHead>
                                  <TableHead className="hidden xl:table-cell text-center">Joined</TableHead>
                                  <TableHead className="text-right">Winnings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(leaderboard as LeaderboardEntry[]).map((entry) => (
                                <TableRow 
                                    key={entry.rank} 
                                    className="font-medium hover:bg-primary/10 cursor-pointer"
                                    onClick={() => router.push(`/players/${encodeURIComponent(entry.username)}`)}
                                >
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {getRankIcon(entry.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-lg text-foreground">
                                          <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{entry.username}</span>
                                          </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">{entry.gamesPlayed}</TableCell>
                                    <TableCell className="text-center hidden lg:table-cell font-mono">{calculateWinRate(entry.wins, entry.gamesPlayed)}</TableCell>
                                    <TableCell className="text-center hidden lg:table-cell font-mono">🔥 {entry.streak}</TableCell>
                                    <TableCell className="hidden xl:table-cell">{entry.lastTournament}</TableCell>
                                    <TableCell className="hidden xl:table-cell text-center font-mono">{format(new Date(entry.joinedOn), 'MMM yyyy')}</TableCell>
                                    <TableCell className="text-right text-primary text-lg font-bold">
                                        ₹{entry.totalWinnings.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </div>

              {/* Mobile View */}
              <div className="space-y-4 md:hidden">
                {(leaderboard as LeaderboardEntry[]).map((entry) => (
                  <Link key={entry.rank} href={`/players/${encodeURIComponent(entry.username)}`} className="block">
                      <Card className="bg-card/80 backdrop-blur-sm border-border/50 text-left w-full active:scale-95 transition-transform duration-150">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 text-center">{getRankIcon(entry.rank)}</div>
                                    <Avatar className="h-12 w-12 border-2 border-accent">
                                        <AvatarFallback className="text-xl">{entry.username.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                    <p className="text-lg font-bold text-foreground">{entry.username}</p>
                                    <p className="text-sm text-muted-foreground font-mono">{entry.clanName}</p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-primary text-lg font-bold">₹{entry.totalWinnings.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">Winnings</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center border-t border-border/50 pt-4">
                                <div>
                                    <p className="font-bold text-foreground">{entry.gamesPlayed}</p>
                                    <p className="text-xs text-muted-foreground">Games</p>
                                </div>
                                <div>
                                    <p className="font-bold text-foreground flex items-center justify-center gap-1">
                                        <Flame className="w-4 h-4 text-destructive"/> {entry.streak}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Streak</p>
                                </div>
                                <div>
                                    <p className="font-bold text-foreground">{calculateWinRate(entry.wins, entry.gamesPlayed)}</p>
                                    <p className="text-xs text-muted-foreground">Win Rate</p>
                                </div>
                            </div>
                        </CardContent>
                      </Card>
                  </Link>
                ))}
              </div>

            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
