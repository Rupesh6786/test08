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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { leaderboard } from '@/lib/data.json';
import type { LeaderboardEntry } from '@/lib/data';
import { Trophy, Award, Medal, Gamepad2, Percent, Flame, Shield, CalendarDays, Twitter, Instagram } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


function PlayerHoverCard({ player }: { player: LeaderboardEntry }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Image
          src={player.avatar}
          alt={player.username}
          width={56}
          height={56}
          className="rounded-full border-2 border-primary"
        />
        <div>
          <h3 className="font-bold text-lg text-foreground">{player.username}</h3>
          <p className="text-sm text-muted-foreground">{player.clanName}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic">"{player.bio}"</p>
      {(player.socialLinks.twitter || player.socialLinks.instagram) && (
          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
             {player.socialLinks.twitter && (
                <Link href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="w-5 h-5" />
                </Link>
             )}
             {player.socialLinks.instagram && (
                <Link href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="w-5 h-5" />
                </Link>
             )}
          </div>
      )}
    </div>
  )
}

export default function LeaderboardPage() {
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
          <TooltipProvider>
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
                                <TableRow key={entry.rank} className="font-medium hover:bg-primary/10">
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center h-full">
                                            {getRankIcon(entry.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-lg text-foreground">
                                      <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-3 cursor-default">
                                            <Image src={entry.avatar} alt={entry.username} width={40} height={40} className="rounded-full" />
                                            <span>{entry.username}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-card/90 backdrop-blur-sm p-0 border-accent shadow-accent/20 shadow-lg">
                                          <PlayerHoverCard player={entry} />
                                        </TooltipContent>
                                      </Tooltip>
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
                  <Card key={entry.rank} className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 flex-shrink-0 text-center">{getRankIcon(entry.rank)}</div>
                        <Image src={entry.avatar} alt={entry.username} width={48} height={48} className="rounded-full border-2 border-accent" />
                        <div>
                          <p className="text-lg font-bold text-foreground">{entry.username}</p>
                          <p className="text-sm text-muted-foreground font-mono">{entry.clanName}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4 space-y-2">
                         <div>
                           <p className="text-primary text-lg font-bold">₹{entry.totalWinnings.toLocaleString()}</p>
                           <p className="text-xs text-muted-foreground">Winnings</p>
                         </div>
                         <div className="flex gap-4 justify-end">
                            <div className="text-center">
                              <p className="font-bold text-foreground">🔥 {entry.streak}</p>
                              <p className="text-xs text-muted-foreground">Streak</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-foreground">{calculateWinRate(entry.wins, entry.gamesPlayed)}</p>
                              <p className="text-xs text-muted-foreground">Win Rate</p>
                            </div>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          </TooltipProvider>
        </section>
      </main>
      <Footer />
    </div>
  );
}
