
"use client";

import { useEffect, useState, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, History, Camera, Users, Gamepad2, PenSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UserProfileData, UserRegistration } from '@/lib/data';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  gameId: z.string().min(5, 'Please enter a valid Game ID.'),
  teamName: z.string().min(2, 'Team name must be at least 2 characters.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


function StatDisplay({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-md">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

export function UserProfile() {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            gameId: '',
            teamName: '',
        }
    });

    useEffect(() => {
        if (profile) {
            form.reset({
                name: profile.name,
                gameId: profile.gameId,
                teamName: profile.teamName,
            });
        }
    }, [profile, form, isEditing]);


    const fetchUserData = async (uid: string) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfileData);
        } else {
            console.log("No such user profile!");
        }
    };
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                if (!profile) {
                    await fetchUserData(user.uid);
                    await fetchRegistrations(user.uid);
                }
            } else {
                setAuthUser(null);
                setProfile(null);
                setRegistrations([]);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [profile]);


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

    const handleImageUpload = async (file: File, user: User) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const { path: downloadURL } = await response.json();

            await updateProfile(user, { photoURL: downloadURL });
            await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });

            setProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);

            toast({ title: "Success", description: "Profile picture updated!" });
        } catch (error) {
            console.error("Upload failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Could not upload your image. Please try again.";
            toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };


    const handleProfileUpdate: SubmitHandler<ProfileFormValues> = async (data) => {
        if (!authUser) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', authUser.uid);
            await updateDoc(userRef, {
                name: data.name,
                gameId: data.gameId,
                teamName: data.teamName,
            });

            if (authUser.displayName !== data.name) {
                await updateProfile(authUser, { displayName: data.name });
            }

            await fetchUserData(authUser.uid);
            toast({ title: "Success", description: "Profile updated successfully." });
            setIsEditing(false);

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        } finally {
            setIsSaving(false);
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

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <div className="text-center">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                    My Profile
                </h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account and view your history.</p>
            </div>

            <Card className="w-full overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-xl">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
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
                        {!isUploading ? (
                            <>
                                <Camera className="w-12 h-12 text-white" />
                                <p className="text-white font-bold mt-2">Change Picture</p>
                            </>
                        ) : (
                            <div className="w-3/4 text-center flex flex-col items-center justify-center">
                               <Loader2 className="w-8 h-8 text-white animate-spin" />
                               <p className="text-white text-sm mt-2">Uploading...</p>
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
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                                {isEditing ? (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl><Input placeholder="Your full name" {...field} disabled={isSaving} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gameId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Game ID</FormLabel>
                                                    <FormControl><Input placeholder="Your in-game ID" {...field} disabled={isSaving} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="teamName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Team Name</FormLabel>
                                                    <FormControl><Input placeholder="Your team's name" {...field} disabled={isSaving} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex gap-4 pt-4">
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h1 className="font-headline text-3xl md:text-5xl font-bold uppercase tracking-wider text-primary">{profile.name}</h1>
                                            <p className="text-muted-foreground text-lg">{profile.email}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-border/50">
                                            <StatDisplay icon={Gamepad2} label="Game ID" value={profile.gameId} />
                                            <StatDisplay icon={Users} label="Team Name" value={profile.teamName} />
                                        </div>
                                        <Button onClick={() => setIsEditing(true)}>
                                            <PenSquare className="mr-2" />
                                            Edit Profile
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </Form>
                    </div>
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
