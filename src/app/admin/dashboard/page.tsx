
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, where, runTransaction, increment } from 'firebase/firestore';
import { Loader2, Users, Trophy, DollarSign, Award, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tournament } from '@/lib/data';
import Link from 'next/link';

type Registration = {
    id: string; // Firestore document ID
    tournamentId: string;
    tournamentTitle: string;
    userEmail: string;
    gameId: string;
    upiId: string;
    paymentStatus: 'Pending' | 'Confirmed';
};

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    liveTournaments: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
          // Fetch users for total players count
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const totalPlayers = usersSnapshot.size;

          // Fetch tournaments to calculate revenue and live count
          const tournamentsSnapshot = await getDocs(collection(db, 'tournaments'));
          const allTournaments = tournamentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) as Tournament[];
          
          // Fetch registrations for revenue and recent activity
          const regQuery = query(collection(db, 'registrations'), orderBy('registeredAt', 'desc'));
          const regSnapshot = await getDocs(regQuery);
          const fetchedRegistrations = regSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
          })) as Registration[];
          setRegistrations(fetchedRegistrations);
          
          // Calculate stats
          const liveTournaments = allTournaments.filter(t => t.status === 'Ongoing').length;
          
          const confirmedRegistrations = fetchedRegistrations.filter(r => r.paymentStatus === 'Confirmed');
          const totalRevenue = confirmedRegistrations.reduce((acc, reg) => {
              const tournament = allTournaments.find(t => t.id === reg.tournamentId);
              return acc + (tournament?.entryFee || 0);
          }, 0);

          setStats({ totalPlayers, liveTournaments, totalRevenue });

      } catch (error) {
          console.error("Error fetching dashboard data: ", error);
          toast({
              title: "Error",
              description: "Failed to fetch dashboard data.",
              variant: "destructive"
          })
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmPayment = async (registrationId: string, tournamentId: string) => {
      if (!tournamentId || typeof tournamentId !== 'string') {
          toast({
              title: "Error",
              description: "This registration has an invalid or missing tournament ID.",
              variant: "destructive"
          });
          return;
      }

      const registrationRef = doc(db, 'registrations', registrationId);
      const tournamentRef = doc(db, 'tournaments', tournamentId);
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

        // Re-fetch to update stats and list
        await fetchDashboardData();
        toast({
            title: "Success",
            description: "Payment confirmed and slot secured.",
            action: <CheckCircle className="h-5 w-5 text-green-500" />
        })
      } catch (error: any) {
          console.error("Error confirming payment: ", error);
          let errorMessage = "Failed to confirm payment.";
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
        })
      }
  };

  const handleMarkAsPending = async (registrationId: string, tournamentId: string) => {
    if (!tournamentId || typeof tournamentId !== 'string') {
        toast({
            title: "Error",
            description: "This registration has an invalid or missing tournament ID.",
            variant: "destructive"
        });
        return;
    }
    const registrationRef = doc(db, 'registrations', registrationId);
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(registrationRef, { paymentStatus: 'Pending' });
            transaction.update(tournamentRef, { slotsAllotted: increment(-1) });
        });

        await fetchDashboardData();
        toast({
            title: "Success",
            description: "Registration marked as pending.",
            action: <XCircle className="h-5 w-5 text-yellow-500" />
        });
    } catch (error: any) {
        console.error("Error marking as pending: ", error);
        toast({
            title: "Error",
            description: "Failed to update registration.",
            variant: "destructive"
        });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/revenue">
                <Card className="hover:bg-muted/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-xl md:text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div></CardContent>
                </Card>
            </Link>
            <Link href="/admin/users">
                <Card className="hover:bg-muted/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-xl md:text-2xl font-bold">{stats.totalPlayers}</div></CardContent>
                </Card>
            </Link>
            <Link href="/admin/matches/create">
                <Card className="hover:bg-muted/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Tournaments</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><div className="text-xl md:text-2xl font-bold">{stats.liveTournaments}</div></CardContent>
                </Card>
            </Link>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Winner Today</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl md:text-2xl font-bold">SniperQueen</div>
                    <p className="text-xs text-muted-foreground">in Free Fire Frenzy</p>
                </CardContent>
            </Card>
        </div>

        {/* Recent Registrations Table */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Registrations</CardTitle>
                <Link href="/admin/registrations" className="text-sm font-medium text-primary hover:underline">
                    View All
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Tournament</TableHead>
                    <TableHead className="hidden md:table-cell">User Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Game ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registrations.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No registered users found.</TableCell>
                    </TableRow>
                    ) : (
                    registrations.slice(0, 5).map(reg => ( // Show recent 5
                        <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.tournamentTitle}</TableCell>
                        <TableCell className="hidden md:table-cell">{reg.userEmail}</TableCell>
                        <TableCell className="hidden sm:table-cell">{reg.gameId}</TableCell>
                        <TableCell>{reg.paymentStatus}</TableCell>
                        <TableCell className="text-right">
                            {reg.paymentStatus === 'Pending' ? (
                                <Button variant="ghost" size="sm" onClick={() => handleConfirmPayment(reg.id, reg.tournamentId)}>Confirm</Button>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => handleMarkAsPending(reg.id, reg.tournamentId)}>Mark Unpaid</Button>
                            )}
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
