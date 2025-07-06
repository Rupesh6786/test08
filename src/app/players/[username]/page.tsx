
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
      <main className="flex-1 relative">
        <div className="absolute inset-0 z-0">
          <Image
            src={`https://placehold.co/1920x1080/000000/FFFFFF.png?text=${player.username.charAt(0)}`}
            data-ai-hint="esports player portrait"
            alt={`${player.username} profile background`}
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 h-full flex flex-col justify-center text-white">
            <div className="max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                    <div className="lg:col-span-1 flex justify-center">
                    <Image
                            src={player.avatar}
                            alt={player.username}
                            width={300}
                            height={300}
                            className="rounded-full border-4 border-primary shadow-lg box-shadow-primary aspect-square object-cover"
                        />
                    </div>

                    <div className="lg:col-span-2 bg-black/40 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/10">
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h1 className="font-headline text-4xl md:text-6xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                                {player.username}
                            </h1>
                            <p className="text-white/80 text-lg mt-2 italic">"{player.bio}"</p>
                        </div>

                        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/20 rounded-md">
                                        <stat.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60">{stat.label}</p>
                                        <p className="text-xl font-bold text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(player.socialLinks.twitter || player.socialLinks.instagram) && (
                            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 border-t border-white/10">
                                {player.socialLinks.twitter && (
                                    <Link href={player.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 hover:text-primary transition-colors">
                                        <Twitter className="w-5 h-5" /> Twitter
                                    </Link>
                                )}
                                {player.socialLinks.instagram && (
                                    <Link href={player.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 hover:text-primary transition-colors">
                                        <Instagram className="w-5 h-5" /> Instagram
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
             <div className="text-center mt-12">
                <Button asChild variant="outline" size="lg" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                    <Link href="/leaderboard"><ArrowLeft className="mr-2" /> Back to Leaderboard</Link>
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
