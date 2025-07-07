
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, runTransaction, increment, getDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, Search, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Tournament, UserRegistration } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { generateConfirmationEmail } from '@/ai/flows/generate-confirmation-email';


export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tournamentFilter, setTournamentFilter] = useState('all');
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const tourneySnapshot = await getDocs(query(collection(db, "tournaments"), orderBy("date", "desc")));
            const fetchedTournaments = tourneySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
            setTournaments(fetchedTournaments);

            const regSnapshot = await getDocs(query(collection(db, "registrations"), orderBy("registeredAt", "desc")));
            const fetchedRegistrations = regSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRegistration[];
            setRegistrations(fetchedRegistrations);
        } catch (error) {
            console.error("Error fetching data: ", error);
            toast({ title: "Error", description: "Failed to fetch registrations.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredRegistrations = useMemo(() => {
        return registrations
            .filter(r => 
                searchTerm === '' ||
                r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.gameId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.upiId.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(r => statusFilter === 'all' || r.paymentStatus === statusFilter)
            .filter(r => tournamentFilter === 'all' || r.tournamentId === tournamentFilter);
    }, [registrations, searchTerm, statusFilter, tournamentFilter]);

    const handleConfirmPayment = async (registration: UserRegistration) => {
        if (!registration.tournamentId || typeof registration.tournamentId !== 'string') {
            toast({
                title: "Error",
                description: "This registration has an invalid or missing tournament ID.",
                variant: "destructive"
            });
            return;
        }
        
        const registrationRef = doc(db, 'registrations', registration.id);
        const tournamentRef = doc(db, 'tournaments', registration.tournamentId);
        
        try {
            await runTransaction(db, async (transaction) => {
                const tournamentDoc = await transaction.get(tournamentRef);
                if (!tournamentDoc.exists()) {
                    throw "Tournament not found!";
                }
                
                const tournamentData = tournamentDoc.data();
                if (tournamentData.slotsAllotted >= tournamentData.slotsTotal) {
                    throw "No slots left in this tournament.";
                }

                transaction.update(registrationRef, { paymentStatus: 'Confirmed' });
                transaction.update(tournamentRef, { slotsAllotted: increment(1) });
            });

            // Draft confirmation email
            const tournament = tournaments.find(t => t.id === registration.tournamentId);
            const userRef = doc(db, 'users', registration.userId);
            const userSnap = await getDoc(userRef);
            const userName = userSnap.exists() ? userSnap.data().name : registration.userEmail;

            if (tournament && userName) {
                const emailContent = await generateConfirmationEmail({
                    userName: userName,
                    tournamentTitle: tournament.title,
                    matchDate: tournament.date,
                    matchTime: tournament.time,
                    entryFee: tournament.entryFee,
                    prizePool: tournament.prizePool,
                });

                const mailtoLink = `mailto:${registration.userEmail}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
                window.open(mailtoLink, '_blank');
            }


            await fetchData();
            toast({ title: "Success", description: "Payment confirmed. An email draft has been opened.", action: <CheckCircle className="h-5 w-5 text-green-500" />});
        } catch (error: any) {
            console.error("Error confirming payment: ", error);
            let errorMessage = "Failed to confirm payment.";
            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    const handleMarkAsPending = async (registration: UserRegistration) => {
        if (!registration.tournamentId || typeof registration.tournamentId !== 'string') {
            toast({
                title: "Error",
                description: "This registration has an invalid or missing tournament ID.",
                variant: "destructive"
            });
            return;
        }

        const registrationRef = doc(db, 'registrations', registration.id);
        const tournamentRef = doc(db, 'tournaments', registration.tournamentId);
        
        try {
            await runTransaction(db, async (transaction) => {
                transaction.update(registrationRef, { paymentStatus: 'Pending' });
                transaction.update(tournamentRef, { slotsAllotted: increment(-1) });
            });
            
            await fetchData();
            toast({ title: "Success", description: "Registration marked as pending. Slot has been freed up.", action: <XCircle className="h-5 w-5 text-yellow-500" />});
        } catch (error: any) {
            console.error("Error marking as pending: ", error);
            let errorMessage = "Failed to update registration.";
             if (error.message) {
                errorMessage = error.message;
            }
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-primary">Manage Registrations</h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by email, game/upi ID..."
                            className="pl-8 sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Filter by tournament" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tournaments</SelectItem>
                            {tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tournament</TableHead>
                                <TableHead>User Email</TableHead>
                                <TableHead>Game ID</TableHead>
                                <TableHead>UPI ID</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                            ) : filteredRegistrations.length > 0 ? (
                                filteredRegistrations.map(reg => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">{reg.tournamentTitle}</TableCell>
                                        <TableCell>{reg.userEmail}</TableCell>
                                        <TableCell className="font-mono">{reg.gameId}</TableCell>
                                        <TableCell className="font-mono">{reg.upiId}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={reg.paymentStatus === 'Confirmed' ? 'success' : 'secondary'}>
                                                {reg.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {reg.paymentStatus === 'Pending' ? (
                                                <Button size="sm" onClick={() => handleConfirmPayment(reg)}>
                                                    Confirm Payment
                                                </Button>
                                            ) : (
                                                <Button variant="secondary" size="sm" onClick={() => handleMarkAsPending(reg)}>
                                                    Mark as Unpaid
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No registrations found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
