
"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, DollarSign, Twitter, Instagram, Calendar, Gamepad2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { UserProfileData } from '@/lib/data';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function PlayerProfilePage({ params }: { params: { username: string } }) {
  const [player, setPlayer] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPlayer = async (name: string) => {
        setIsLoading(true);
        setError(false);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("name", "==", name), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(true);
            } else {
                setPlayer(querySnapshot.docs[0].data() as UserProfileData);
            }
        } catch (err) {
            console.error("Error fetching player profile:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const username = decodeURIComponent(params.username);
    fetchPlayer(username);
  }, [params.username]);


  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        </div>
    );
  }
  
  if (error || !player) {
    notFound();
  }
  
  const gameName = 'PUBG'; // Placeholder, as this info isn't in UserProfileData

  const stats = [
    { icon: Trophy, label: 'Clan', value: player.teamName },
    { icon: Gamepad2, label: 'Preferred Game', value: gameName },
    { icon: DollarSign, label: 'Total Winnings', value: `₹${(player.totalEarnings ?? 0).toLocaleString()}` },
    { icon: Calendar, label: 'Member Since', value: player.joinedOn ? format(player.joinedOn.toDate(), 'MMM yyyy') : 'N/A' },
  ];
  
  // Mock social links since they are not in the DB
  const socialLinks = {
    twitter: "https://x.com/example",
    instagram: "https://instagram.com/example"
  };

  const DetailsContent = () => (
    <>
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

      {(socialLinks.twitter || socialLinks.instagram) && (
        <div className="flex items-center justify-start gap-6 py-4 border-t border-border/50">
          {socialLinks.twitter && (
            <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" /> Twitter
            </Link>
          )}
          {socialLinks.instagram && (
            <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
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
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <Card className="w-full max-w-lg lg:max-w-6xl overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-xl">
          {/* Mobile and Tablet View with overlay */}
          <div className="lg:hidden">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={player.photoURL || 'https://placehold.co/600x800.png'}
                data-ai-hint="gamer portrait"
                alt={player.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h1 className="font-headline text-4xl font-bold uppercase tracking-wider" style={{ textShadow: '0 0 10px hsl(var(--primary))' }}>
                  {player.name}
                </h1>
                <p className="text-white/90 text-lg italic mt-2">"{player.bio || 'New challenger in the Arena!'}"</p>
              </div>
            </div>
            <div className="p-6">
              <DetailsContent />
            </div>
          </div>

          {/* Desktop View (previous design) */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-0">
            <div className="relative lg:col-span-2">
              <Image
                src={player.photoURL || 'https://placehold.co/600x1000.png'}
                data-ai-hint="gamer portrait"
                alt={player.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="lg:col-span-3 flex flex-col justify-center p-12">
              <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary">
                {player.name}
              </h1>
              <p className="text-muted-foreground text-lg italic mt-2">"{player.bio || 'New challenger in the Arena!'}"</p>
              <DetailsContent />
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
