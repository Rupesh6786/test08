"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { Community } from '@/lib/data';
import { CommunityCard } from '@/components/community-card';
import { CreateCommunityDialog } from '@/components/create-community-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [communities, setCommunities] = useState<Community[]>([]);
    const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { toast } = useToast();
    
    const fetchCommunities = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedCommunities = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Community[];
            setCommunities(fetchedCommunities);
            setFilteredCommunities(fetchedCommunities);
        } catch (error) {
            console.error("Error fetching communities:", error);
            toast({ title: "Error", description: "Failed to load communities.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        const results = communities.filter(community =>
            community.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCommunities(results);
    }, [searchTerm, communities]);

    return (
        <>
            <CreateCommunityDialog 
                isOpen={isCreateDialogOpen}
                setIsOpen={setIsCreateDialogOpen}
                onCommunityCreated={fetchCommunities}
            />
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-6">
                            <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wider text-primary text-shadow-primary">
                                Community
                            </h1>
                        </div>
                        
                        <div className="max-w-4xl mx-auto mb-12">
                           <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative w-full flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search for a community..."
                                        className="pl-10 h-12 text-base"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button size="lg" className="w-full sm:w-auto" onClick={() => setIsCreateDialogOpen(true)}>
                                    <Plus className="mr-2 h-5 w-5" /> Create Community
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-center md:text-left">Suggested Communities</h2>
                             {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                       <div key={i} className="text-center p-6 bg-card/80 backdrop-blur-sm border-border/50 flex flex-col items-center gap-4 rounded-lg">
                                           <Skeleton className="h-24 w-24 rounded-full" />
                                           <Skeleton className="h-5 w-3/4" />
                                           <Skeleton className="h-4 w-1/2" />
                                           <Skeleton className="h-10 w-full" />
                                       </div>
                                    ))}
                                </div>
                            ) : (
                                filteredCommunities.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {filteredCommunities.map(community => (
                                            <CommunityCard key={community.id} community={community} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">No communities found matching your search.</p>
                                    </div>
                                )
                             )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </>
    );
}
