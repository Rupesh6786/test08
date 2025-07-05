"use client";

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User as UserIcon, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserProfileData, UserRegistration } from '@/lib/data';
import Link from 'next/link';
import { Button } from './ui/button';

export function UserProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
        const q = query(
            collection(db, 'registrations'),
            where('userId', '==', uid)
        );
        const querySnapshot = await getDocs(q);
        const userRegistrations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as UserRegistration[];

        userRegistrations.sort((a, b) => {
            if (a.registeredAt && b.registeredAt) {
                return b.registeredAt.toMillis() - a.registeredAt.toMillis();
            }
            return 0;
        });

        setRegistrations(userRegistrations);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    if (!authUser) {
        return (
             <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Please Log In</h2>
                <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
                 <Button asChild className="mt-4">
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                    My Profile
                </h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account and view your history.</p>
            </div>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><UserIcon /> User Information</CardTitle>
                    <CardDescription>Your personal and in-game details.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {profile ? (
                        <>
                            <div><strong className="text-muted-foreground">Name:</strong><p className="font-medium">{profile.name}</p></div>
                            <div><strong className="text-muted-foreground">Email:</strong><p className="font-medium">{profile.email}</p></div>
                            <div><strong className="text-muted-foreground">Game ID:</strong><p className="font-medium font-mono">{profile.gameId}</p></div>
                            <div><strong className="text-muted-foreground">Team Name:</strong><p className="font-medium">{profile.teamName}</p></div>
                        </>
                    ) : (
                        <p>No profile information found.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl"><History /> Registration History</CardTitle>
                    <CardDescription>All the tournaments you have registered for.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>Game ID</TableHead>
                                <TableHead className="text-center">Payment Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.length > 0 ? (
                                registrations.map(reg => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">{reg.tournamentTitle}</TableCell>
                                        <TableCell className="font-mono">{reg.gameId}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={reg.paymentStatus === 'Confirmed' ? 'success' : 'secondary'}>
                                                {reg.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">
                                        You haven't registered for any tournaments yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
