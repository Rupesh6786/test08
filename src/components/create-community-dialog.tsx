"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Loader2, ImagePlus } from 'lucide-react';

const communitySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(30, 'Name cannot be longer than 30 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(100, 'Description cannot be longer than 100 characters'),
});

type CommunityFormValues = z.infer<typeof communitySchema>;

interface CreateCommunityDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCommunityCreated: () => void;
}

export function CreateCommunityDialog({ isOpen, setIsOpen, onCommunityCreated }: CreateCommunityDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const form = useForm<CommunityFormValues>({
        resolver: zodResolver(communitySchema),
        defaultValues: { name: '', description: '' },
    });
    
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        form.reset();
        setAvatarFile(null);
        setAvatarPreview(null);
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsOpen(open);
    }

    const onSubmit = async (data: CommunityFormValues) => {
        const user = auth.currentUser;
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to create a community.", variant: "destructive" });
            return;
        }
        if (!avatarFile) {
            toast({ title: "Error", description: "Please upload an avatar for the community.", variant: "destructive" });
            return;
        }
        
        setIsSaving(true);
        
        let avatarUrl = '';
        try {
            // 1. Upload image
            const formData = new FormData();
            formData.append('file', avatarFile);
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error('Avatar upload failed');
            const { path } = await uploadResponse.json();
            avatarUrl = path;

            // 2. Create community in Firestore
            await addDoc(collection(db, "communities"), {
                name: data.name,
                description: data.description,
                avatar: avatarUrl,
                creatorId: user.uid,
                members: 1,
                createdAt: serverTimestamp(),
                game: 'All', // Default game
            });

            toast({ title: "Success", description: `Community "${data.name}" created.` });
            onCommunityCreated(); // Callback to refresh the list on the parent page
            handleOpenChange(false);
            
        } catch (error) {
            console.error("Failed to create community:", error);
            toast({ title: "Error", description: "Could not create community. Please try again.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new Community</DialogTitle>
              <DialogDescription>
                Build a new hub for players to connect. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-center">
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/png, image/jpeg" className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <ImagePlus className="w-8 h-8"/>
                            )}
                        </button>
                    </div>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Community Name</FormLabel>
                                <FormControl><Input placeholder="Elite Gamers" {...field} disabled={isSaving} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea placeholder="A place for the best of the best..." {...field} disabled={isSaving} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                      <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Community
                      </Button>
                    </DialogFooter>
                </form>
            </Form>
          </DialogContent>
        </Dialog>
    );
}
