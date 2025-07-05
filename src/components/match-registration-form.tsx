
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';


const registrationSchema = z.object({
  gameId: z.string().min(5, 'Please enter a valid Game ID'),
  teamName: z.string().min(2, 'Please enter your team name'),
  upiId: z.string().min(3, 'Please enter a valid UPI ID').includes('@', {message: "UPI ID must contain '@'"}),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function MatchRegistrationForm({ tournamentTitle, tournamentId }: { tournamentTitle: string; tournamentId: string }) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            gameId: '',
            teamName: '',
            upiId: '',
        }
    });

    const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
        const user = auth.currentUser;

        if (!user) {
            toast({
                title: "Not Logged In",
                description: "You must be logged in to register for a match.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "registrations"), {
                userId: user.uid,
                userEmail: user.email,
                tournamentId: tournamentId,
                tournamentTitle: tournamentTitle,
                gameId: data.gameId,
                teamName: data.teamName,
                upiId: data.upiId,
                registeredAt: serverTimestamp(),
                paymentStatus: 'Pending',
            });
    
            const phoneNumber = '919321738137';
            const message = `I have successfully registered for the '${tournamentTitle}' tournament. My UPI ID is ${data.upiId}, my Game ID is ${data.gameId}, and my Team Name is ${data.teamName}. Please confirm my registration.`;
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
            
            // Redirect to success page instead of showing toast
            router.push(`/tournaments/${tournamentId}/register/success`);

        } catch (error) {
            console.error("Failed to save registration:", error);
            toast({
                title: "Registration Failed",
                description: "Could not save your registration details. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="gameId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Game ID</FormLabel>
                    <FormControl>
                        <Input placeholder="Your in-game ID" {...field} disabled={isSubmitting} />
                    </FormControl>
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
                    <FormControl>
                        <Input placeholder="Your team's name" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="upiId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>UPI ID for Payment</FormLabel>
                    <FormControl>
                        <Input placeholder="yourname@upi" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register & Confirm on WhatsApp
                </Button>
            </form>
        </Form>
    );
}
