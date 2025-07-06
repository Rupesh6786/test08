"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import type { Community } from '@/lib/data';
import { Users } from 'lucide-react';

export function CommunityCard({ community }: { community: Community }) {
    const { toast } = useToast();

    const handleJoin = () => {
        toast({
            title: "Coming Soon!",
            description: `Joining "${community.name}" is not yet implemented.`
        });
    };

    return (
        <Card className="text-center p-6 bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-2 border-accent">
                <AvatarImage src={community.avatar} alt={community.name} />
                <AvatarFallback className="text-4xl bg-muted">
                    {community.avatar ? community.name.charAt(0) : <Users className="w-12 h-12 text-muted-foreground" />}
                </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-foreground">{community.name}</h3>
                <p className="text-sm text-muted-foreground">{community.members} members</p>
            </div>
            <Button onClick={handleJoin} className="w-full">Join</Button>
        </Card>
    );
}
