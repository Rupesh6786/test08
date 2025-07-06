
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { leaderboard } from '@/lib/data.json';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
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
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
          {/* Left side: Image */}
          <div className="relative h-full hidden lg:block">
            <Image
              src={player.avatar}
              alt={player.username}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Right side: Details */}
          <div className="flex flex-col justify-center p-8 md:p-16">
            
            <div className="lg:hidden mb-8">
              <Image
                src={player.avatar}
                alt={player.username}
                width={150}
                height={150}
                className="object-cover rounded-full border-4 border-primary mx-auto"
              />
            </div>

            <div className="text-center lg:text-left">
                <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                {player.username}
                </h1>
                <p className="text-muted-foreground text-lg italic mt-2">"{player.bio}"</p>
            </div>
            
            <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-md">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {(player.socialLinks.twitter || player.socialLinks.instagram) && (
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 border-t border-border/50">
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

            <div className="text-center lg:text-left mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/leaderboard"><ArrowLeft className="mr-2" /> Back to Leaderboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
