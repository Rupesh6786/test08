
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { leaderboard } from '@/lib/data.json';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, DollarSign, Twitter, Instagram, Calendar, Gamepad2 } from 'lucide-react';
import { format } from 'date-fns';
import type { LeaderboardEntry } from '@/lib/data';

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  const player = (leaderboard as LeaderboardEntry[]).find((p) => p.username === username);

  if (!player) {
    notFound();
  }
  
  const gameName = player.lastTournament.toLowerCase().includes('pubg') ? 'PUBG' : 'Free Fire';

  const stats = [
    { icon: Trophy, label: 'Clan', value: player.clanName },
    { icon: Gamepad2, label: 'Preferred Game', value: gameName },
    { icon: DollarSign, label: 'Total Winnings', value: `₹${player.totalWinnings.toLocaleString()}` },
    { icon: Calendar, label: 'Member Since', value: format(new Date(player.joinedOn), 'MMM yyyy') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <Card className="w-full max-w-lg lg:max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-xl">
          
          {/* Left Side: Image + Overlay Info */}
          <div className="relative aspect-square lg:aspect-auto">
             <Image
              src={player.avatar}
              alt={player.username}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>
                    {player.username}
                </h1>
                <p className="text-white/90 text-lg italic mt-2">"{player.bio}"</p>
            </div>
          </div>
          
          {/* Right Side: Stats and Actions */}
          <div className="flex flex-col justify-center p-6 md:p-8">
            <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-md">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {(player.socialLinks.twitter || player.socialLinks.instagram) && (
              <div className="flex items-center justify-start gap-6 py-4 border-t border-border/50">
                {player.socialLinks.twitter && (
                  <Link href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" /> Twitter
                  </Link>
                )}
                {player.socialLinks.instagram && (
                  <Link href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="w-5 h-5" /> Instagram
                  </Link>
                )}
              </div>
            )}

            <div className="mt-6">
              <Button asChild variant="outline" size="lg">
                <Link href="/leaderboard"><ArrowLeft className="mr-2" /> Back to Leaderboard</Link>
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
