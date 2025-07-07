
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Loader2, Search, UserX, UserCheck, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { UserProfileData } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = querySnapshot.docs.map(doc => doc.data() as UserProfileData);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch users.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => 
        searchTerm === '' || 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(u => statusFilter === 'all' || u.status === statusFilter);
  }, [users, searchTerm, statusFilter]);

  const handleStatusChange = async (uid: string, newStatus: 'active' | 'banned') => {
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, { status: newStatus });
      await fetchUsers(); // Re-fetch to update UI
      toast({
        title: "Success",
        description: `User has been ${newStatus === 'banned' ? 'banned' : 'unbanned'}.`
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive"});
    }
  };

  const handleDeleteUser = async (uid: string) => {
    // Note: This only deletes Firestore record. Auth user needs separate deletion.
    try {
        await deleteDoc(doc(db, "users", uid));
        await fetchUsers(); // Re-fetch
        toast({
            title: "User Deleted",
            description: "The user's data has been removed from Firestore.",
        });
    } catch (error) {
        toast({ title: "Error", description: "Failed to delete user.", variant: "destructive"});
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary">Players / Users</h1>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search players..."
              className="pl-8 sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.teamName}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'banned' ? 'destructive' : 'success'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                        {user.status === 'active' ? (
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.uid, 'banned')}>
                            <UserX className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.uid, 'active')}>
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user's
                                data from the database.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center h-24">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Card View */}
          <div className="space-y-4 p-4 md:hidden">
            {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <div key={user.uid} className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <p className="text-xs text-muted-foreground">Team: {user.teamName}</p>
                            </div>
                            <Badge variant={user.status === 'banned' ? 'destructive' : 'success'} className="shrink-0 capitalize">{user.status}</Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border/20 flex justify-end space-x-1">
                            <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                             {user.status === 'active' ? (
                                <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.uid, 'banned')}>
                                <UserX className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button variant="ghost" size="icon" onClick={() => handleStatusChange(user.uid, 'active')}>
                                <UserCheck className="w-4 h-4" />
                                </Button>
                            )}
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the user's data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))
            ) : (
              <div className="text-center h-24 flex items-center justify-center">
                  <p className="text-muted-foreground">No users found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
