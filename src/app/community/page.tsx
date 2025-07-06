
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { leaderboard } from '@/lib/data.json';
import { communities } from '@/lib/data';
import type { LeaderboardEntry, Community } from '@/lib/data';

export default function CommunityPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredPlayers = useMemo(() => {
        if (!searchTerm) return leaderboard as LeaderboardEntry[];
        return (leaderboard as LeaderboardEntry[]).filter(player =>
            player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.gameId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const filteredCommunities = useMemo(() => {
        if (!searchTerm) return communities;
        return communities.filter(community =>
            community.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleJoinCommunity = (communityName: string) => {
        toast({
            title: "Coming Soon!",
            description: `Joining the "${communityName}" community is not yet implemented.`,
        });
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                            Community Hub
                        </h1>
                        <p className="text-lg text-muted-foreground mt-2">Find players, join communities, and grow your network.</p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Tabs defaultValue="players" className="w-full">
                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                                <div className="relative w-full flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or game ID..."
                                        className="pl-10 h-12 text-base"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <TabsList className="grid w-full grid-cols-2 sm:w-auto shrink-0">
                                    <TabsTrigger value="players">Players</TabsTrigger>
                                    <TabsTrigger value="communities">Communities</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="players">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPlayers.length > 0 ? (
                                        filteredPlayers.map(player => (
                                            <Link key={player.username} href={`/players/${encodeURIComponent(player.username)}`} className="block group">
                                                <Card className="h-full bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                                                    <CardContent className="p-4 flex items-center gap-4">
                                                        <Avatar className="h-16 w-16 border-2 border-accent group-hover:border-primary transition-colors">
                                                            <AvatarImage src={player.avatar} alt={player.username} />
                                                            <AvatarFallback className="text-2xl">{player.username.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-lg text-foreground">{player.username}</p>
                                                            <p className="text-sm text-muted-foreground font-mono">{player.clanName}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">ID: {player.gameId}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="md:col-span-2 lg:col-span-3 text-center py-12">
                                            <p className="text-muted-foreground">No players found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="communities">
                                <div className="space-y-4">
                                    {filteredCommunities.length > 0 ? (
                                        filteredCommunities.map(community => (
                                            <Card key={community.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                                                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                                                     <Avatar className="h-20 w-20 border-2 border-accent">
                                                        <AvatarImage src={community.avatar} alt={community.name} />
                                                        <AvatarFallback className="text-3xl">{community.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-grow text-center sm:text-left">
                                                        <h3 className="font-bold text-xl text-foreground">{community.name}</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">{community.description}</p>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                                        <div className="flex items-center gap-1 font-bold">
                                                            <Users className="w-4 h-4 text-primary" />
                                                            <span>{(community.followers / 1000).toFixed(1)}k</span>
                                                        </div>
                                                        <Button size="sm" onClick={() => handleJoinCommunity(community.name)}>
                                                            <UserPlus className="mr-2 h-4 w-4" /> Join
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <p className="text-muted-foreground">No communities found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
