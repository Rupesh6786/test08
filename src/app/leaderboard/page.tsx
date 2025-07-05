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
import { Trophy, Award, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-yellow-600" />;
    return <span className="font-bold text-lg">{rank}</span>;
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
            <div className="hidden md:block max-w-5xl mx-auto">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-0">
                      <Table>
                          <TableHeader>
                              <TableRow>
                              <TableHead className="w-[100px] text-center">Rank</TableHead>
                              <TableHead>Username</TableHead>
                              <TableHead>Game ID</TableHead>
                              <TableHead className="text-right">Total Winnings</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {leaderboard.map((entry) => (
                              <TableRow key={entry.rank} className="font-medium hover:bg-primary/10">
                                  <TableCell className="text-center">
                                      <div className="flex justify-center items-center h-full">
                                          {getRankIcon(entry.rank)}
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-lg text-foreground">{entry.username}</TableCell>
                                  <TableCell className="text-muted-foreground font-mono">{entry.gameId}</TableCell>
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
              {leaderboard.map((entry) => (
                <Card key={entry.rank} className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex-shrink-0 text-center">{getRankIcon(entry.rank)}</div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{entry.username}</p>
                        <p className="text-sm text-muted-foreground font-mono">{entry.gameId}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                       <p className="text-primary text-lg font-bold">
                           ₹{entry.totalWinnings.toLocaleString()}
                       </p>
                       <p className="text-xs text-muted-foreground">Winnings</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
