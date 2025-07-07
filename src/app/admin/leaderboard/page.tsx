
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { leaderboard } from '@/lib/data.json';
import { Trophy, Award, Medal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminLeaderboardPage() {
  const [gameFilter, setGameFilter] = useState('all');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-yellow-600" />;
    return <span className="font-bold text-md">{rank}</span>;
  }
  
  const filteredLeaderboard = leaderboard;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-primary">Winners & Leaderboard</h1>
          <p className="text-muted-foreground">Top players across all tournaments.</p>
        </div>
        <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="PUBG">PUBG</SelectItem>
                <SelectItem value="Free Fire">Free Fire</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Game ID</TableHead>
                  <TableHead>Total Wins</TableHead>
                  <TableHead className="text-right">Total Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaderboard.map((entry) => (
                  <TableRow key={entry.rank}>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center h-full">
                          {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.username}</TableCell>
                    <TableCell className="font-mono">{entry.gameId}</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell className="text-right font-bold text-primary">₹{entry.totalWinnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
           {/* Mobile Card View */}
          <div className="space-y-4 p-4 md:hidden">
              {filteredLeaderboard.length > 0 ? (
                  filteredLeaderboard.map(entry => (
                      <div key={entry.rank} className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-3">
                                  <div className="text-center w-8 shrink-0">{getRankIcon(entry.rank)}</div>
                                  <div>
                                      <p className="font-bold">{entry.username}</p>
                                      <p className="text-sm text-muted-foreground font-mono">Game ID: {entry.gameId}</p>
                                  </div>
                              </div>
                              <div className="text-right shrink-0">
                                  <p className="font-bold text-primary text-lg">₹{entry.totalWinnings.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground">Earnings</p>
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-muted-foreground/20 grid grid-cols-2 text-center">
                              <div>
                                 <p className="font-bold text-foreground">12</p>
                                 <p className="text-xs text-muted-foreground">Total Wins</p>
                              </div>
                               <div>
                                 <p className="font-bold text-foreground">{entry.gameId.startsWith("51") ? "Free Fire" : "PUBG"}</p>
                                 <p className="text-xs text-muted-foreground">Game</p>
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                   <div className="flex justify-center items-center h-24">
                      <p className="text-muted-foreground">No winners found.</p>
                  </div>
              )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
