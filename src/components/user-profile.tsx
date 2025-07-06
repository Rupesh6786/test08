
"use client";

import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, Check, Play, DollarSign, Target, Star, Image as ImageIcon, UserPlus, MessageSquare, Users, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserProfileData, UserRegistration } from '@/lib/data';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { PubgIcon } from './icons/pubg-icon';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, children }: { title: string; value: string | number; children: React.ReactNode }) {
    return (
        <div className="bg-card/80 rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs uppercase tracking-wider">{title}</div>
            <div className="text-xl font-bold flex items-center justify-center gap-2 mt-1">
                {children}
                <span>{value}</span>
            </div>
        </div>
    );
}

const performanceData = [
  { name: 'Jan', perf: 4 }, { name: 'Feb', perf: 3 }, { name: 'Mar', perf: 5 },
  { name: 'Apr', perf: 6 }, { name: 'May', perf: 8 }, { name: 'Jun', perf: 7 },
];

const mockMedia = [
    { src: 'https://placehold.co/600x400.png', hint: 'gaming character' },
    { src: 'https://placehold.co/600x400.png', hint: 'gaming screenshot' },
    { src: 'https://placehold.co/600x400.png', hint: 'gamer profile' },
    { src: 'https://placehold.co/600x400.png', hint: 'winner chicken dinner' },
]

export function UserProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserData = async (uid: string) => {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfileData);
            } else {
                console.log("No such user profile!");
            }
        };

        const fetchRegistrations = async (uid: string) => {
            const q = query(collection(db, 'registrations'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const userRegistrations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRegistration[];
            userRegistrations.sort((a, b) => a.registeredAt && b.registeredAt ? b.registeredAt.toMillis() - a.registeredAt.toMillis() : 0);
            setRegistrations(userRegistrations);
        };

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                await fetchUserData(user.uid);
                await fetchRegistrations(user.uid);
            } else {
                setAuthUser(null);
                setProfile(null);
                setRegistrations([]);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && authUser) {
            handleImageUpload(file, authUser);
        }
    };

    const handleImageUpload = async (file: File, user: User) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const { path: downloadURL } = await response.json();

            await updateProfile(user, { photoURL: downloadURL });
            await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });

            setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
            toast({ title: "Success", description: "Profile picture updated!" });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({ title: "Upload Failed", description: "Could not upload your image.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (!authUser || !profile) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Please Log In</h2>
                <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
                <Button asChild className="mt-4"><Link href="/login">Login</Link></Button>
            </div>
        );
    }
    
    const winRate = (profile.totalMatches ?? 0) > 0 ? (((profile.matchesWon ?? 0) / profile.totalMatches!) * 100).toFixed(1) + '%' : '0%';
    
    const mockTournamentHistory = registrations.map(reg => ({
        ...reg,
        placement: Math.random() > 0.5 ? 'Winner' : 'Top 10',
        winnings: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 1000 : Math.floor(Math.random() * 500),
        date: reg.registeredAt ? format(reg.registeredAt.toDate(), 'MMM yyyy') : 'N/A'
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto text-foreground">
             <div className="flex justify-between items-center">
                 <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-wider text-primary font-headline">BATTLEBUCKS</span>
                </Link>
                <Button variant="ghost" size="icon"><Settings className="w-6 h-6" /></Button>
             </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <div 
                    className="relative group w-32 h-32 md:w-40 md:h-40 flex-shrink-0"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <Avatar className="w-full h-full rounded-lg border-4 border-primary/50">
                        <AvatarImage src={profile.photoURL || `https://placehold.co/160x160.png`} alt={profile.name} />
                        <AvatarFallback className="rounded-lg text-4xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                     <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Change'}
                    </div>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg"
                        className="hidden"
                        disabled={isUploading}
                    />
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center md:justify-start gap-2">
                        {profile.name}
                        <Check className="w-7 h-7 text-blue-500 fill-current bg-white rounded-full p-1" />
                    </h1>
                    <p className="text-muted-foreground mt-1">{profile.bio || 'New challenger in the Arena!'}</p>
                    <p className="text-sm text-muted-foreground mt-2">Member since {profile.joinedOn ? format(profile.joinedOn.toDate(), 'MMM yyyy') : 'N/A'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <StatCard title="Total Matches" value={profile.totalMatches ?? 0}><History className="w-4 h-4 text-muted-foreground"/></StatCard>
                <StatCard title="Matches Won" value={profile.matchesWon ?? 0}><Trophy className="w-4 h-4 text-muted-foreground"/></StatCard>
                <StatCard title="Win Rate" value={winRate}><Target className="w-4 h-4 text-muted-foreground"/></StatCard>
                <StatCard title="Earnings" value={`₹${(profile.totalEarnings ?? 0).toLocaleString()}`}><DollarSign className="w-4 h-4 text-muted-foreground"/></StatCard>
                <StatCard title="Current Tier" value="147"><Play className="w-4 h-4 text-muted-foreground"/></StatCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-card/80">
                        <CardHeader><CardTitle>Game Statistics</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    <PubgIcon className="w-8 h-8" />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Favorite Game</div>
                                        <div className="font-bold">PUBG</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Game ID</div>
                                    <div className="font-bold">{profile.gameId}</div>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="font-bold text-2xl">3.98</div>
                                    <div className="text-xs text-muted-foreground">Kill/Death</div>
                                </div>
                                <div>
                                    <div className="font-bold text-2xl">47</div>
                                    <div className="text-xs text-muted-foreground">MVPs</div>
                                </div>
                             </div>
                             <div>
                                <h4 className="text-sm font-semibold mb-2 text-center">Recent Performance</h4>
                                <ResponsiveContainer width="100%" height={80}>
                                    <LineChart data={performanceData}>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                                        <Line type="monotone" dataKey="perf" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/80">
                        <CardHeader><CardTitle>Media Gallery</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                           {mockMedia.map((media, index) => (
                               <Image key={index} src={media.src} data-ai-hint={media.hint} alt="Gallery image" width={200} height={200} className="rounded-md aspect-square object-cover" />
                           ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-card/80">
                        <CardHeader><CardTitle>Tournament History</CardTitle></CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                            {mockTournamentHistory.length > 0 ? mockTournamentHistory.slice(0, 5).map(reg => (
                               <div key={reg.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                                    <div>
                                        <p className="font-bold">{reg.tournamentTitle}</p>
                                        <p className="text-sm text-muted-foreground">{reg.placement}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">₹{reg.winnings.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{reg.date}</p>
                                    </div>
                               </div>
                            )) : <p className="text-muted-foreground text-center py-4">No tournament history yet.</p>}
                           </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/80">
                        <CardHeader><CardTitle>Social + Community</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-around text-center">
                               <div>
                                   <div className="text-xl font-bold">789</div>
                                   <div className="text-sm text-muted-foreground">Followers</div>
                               </div>
                               <div>
                                   <div className="text-xl font-bold">659</div>
                                   <div className="text-sm text-muted-foreground">Following</div>
                               </div>
                           </div>
                           <div className="flex gap-4">
                                <Button className="w-full"><UserPlus className="mr-2"/>Add Friend</Button>
                                <Button variant="secondary" className="w-full"><MessageSquare className="mr-2"/>Send Message</Button>
                           </div>
                           <div className="flex items-center justify-between p-2 rounded-lg bg-muted">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5"/>
                                    <span className="font-semibold">{profile.teamName}</span>
                                </div>
                                <div className="flex -space-x-2">
                                    <Avatar className="h-6 w-6 border-2 border-card"><AvatarImage src="https://placehold.co/40x40.png" /></Avatar>
                                    <Avatar className="h-6 w-6 border-2 border-card"><AvatarImage src="https://placehold.co/40x40.png" /></Avatar>
                                    <Avatar className="h-6 w-6 border-2 border-card"><AvatarImage src="https://placehold.co/40x40.png" /></Avatar>
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
