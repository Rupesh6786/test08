"use client";

import { useEffect, useState, useRef } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, type User, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, User as UserIcon, History, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserProfileData, UserRegistration } from '@/lib/data';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';

export function UserProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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
        const q = query(collection(db, 'registrations'), where('userId', '==', uid));
        const querySnapshot = await getDocs(q);
        const userRegistrations = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRegistration[];
        userRegistrations.sort((a, b) => a.registeredAt && b.registeredAt ? b.registeredAt.toMillis() - a.registeredAt.toMillis() : 0);
        setRegistrations(userRegistrations);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && authUser) {
            handleImageUpload(file, authUser);
        }
    };

    const handleImageUpload = (file: File, user: User) => {
        setIsUploading(true);
        const storageRef = ref(storage, `avatars/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ title: "Upload Failed", description: "Could not upload your image. Please try again.", variant: "destructive" });
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await updateProfile(user, { photoURL: downloadURL });
                await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
                
                setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
                
                toast({ title: "Success", description: "Profile picture updated!" });
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
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
    
    const stats = [
        { icon: UserIcon, label: 'Game ID', value: profile.gameId },
        { icon: UserIcon, label: 'Team Name', value: profile.teamName },
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <div className="text-center">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                    My Profile
                </h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account and view your history.</p>
            </div>

            <Card className="w-full grid grid-cols-1 lg:grid-cols-5 gap-0 overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
                <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-auto group">
                    <Image
                        src={profile.photoURL || `https://placehold.co/400x300.png`}
                        data-ai-hint="avatar placeholder"
                        alt={profile.name || 'Player avatar'}
                        fill
                        className="object-cover"
                    />
                    <div 
                        className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                       {!isUploading && (
                           <>
                                <Camera className="w-12 h-12 text-white" />
                                <p className="text-white font-bold mt-2">Change Picture</p>
                           </>
                       )}
                       {isUploading && (
                           <div className="w-3/4 text-center">
                               <Progress value={uploadProgress} className="h-2 bg-white/30" indicatorClassName="bg-primary" />
                               <p className="text-white text-sm mt-2">Uploading... {Math.round(uploadProgress)}%</p>
                           </div>
                       )}
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
                
                <div className="lg:col-span-3 flex flex-col justify-center p-8 md:p-12">
                     <div className="text-center lg:text-left">
                        <h1 className="font-headline text-3xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                            {profile.name}
                        </h1>
                        <p className="text-muted-foreground text-lg mt-2">{profile.email}</p>
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
                    {/* Add edit button or other actions here if needed */}
                </div>
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
                                <TableHead>Game ID Used</TableHead>
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
                                    <TableCell colSpan={3} className="text-center h-24">You haven't registered for any tournaments yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
