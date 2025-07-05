
"use client";

import Link from 'next/link';
import type { Tournament } from '@/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PubgIcon } from '@/components/icons/pubg-icon';
import { FreeFireIcon } from '@/components/icons/freefire-icon';
import { Users, Calendar, Trophy, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type TournamentCardProps = {
  tournament: Tournament;
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleRegisterClick = (e: React.MouseEvent) => {
    if (!authUser) {
      e.preventDefault();
      router.push('/login');
    }
  };

  const slotsAllotted = tournament.slotsAllotted || 0;
  const slotsPercentage = (slotsAllotted / tournament.slotsTotal) * 100;
  const slotsLeft = tournament.slotsTotal - slotsAllotted;

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/20 hover:border-primary/50" style={{ transformStyle: 'preserve-3d' }}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg tracking-wide">{tournament.title}</CardTitle>
            {tournament.game === 'PUBG' ? <PubgIcon className="w-10 h-10" /> : <FreeFireIcon className="w-10 h-10" />}
        </div>
        <div className={`text-xs font-bold uppercase px-2 py-1 rounded-full w-fit ${tournament.status === 'Ongoing' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
            {tournament.status}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3 text-sm">
        <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{tournament.date} @ {tournament.time}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
            <Coins className="w-4 h-4 mr-2 text-primary" />
            <span>Entry Fee: <span className="font-bold text-foreground">₹{tournament.entryFee}</span></span>
        </div>
        <div className="flex items-center text-muted-foreground">
            <Trophy className="w-4 h-4 mr-2 text-primary" />
            <span>Prize Pool: <span className="font-bold text-foreground">₹{tournament.prizePool.toLocaleString()}</span></span>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Slots Left</span>
                </div>
                <span className="font-bold text-foreground">{slotsLeft} / {tournament.slotsTotal}</span>
            </div>
            <Progress value={slotsPercentage} className="h-2 bg-primary/20" indicatorClassName="bg-primary" />
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button asChild className="w-full bg-primary/90 text-primary-foreground hover:bg-primary font-bold transition-all hover:shadow-lg hover:box-shadow-primary">
            <Link href={`/tournaments/${tournament.id}/register`} onClick={handleRegisterClick}>Register Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
