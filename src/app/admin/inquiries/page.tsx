
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Loader2, MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Inquiry } from '@/lib/data';
import { format } from 'date-fns';

export default function AdminInquiriesPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const { toast } = useToast();

    const fetchInquiries = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "inquiries"), orderBy("submittedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedInquiries = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Inquiry[];
            setInquiries(fetchedInquiries);
        } catch (error) {
            console.error("Error fetching inquiries: ", error);
            toast({ title: "Error", description: "Failed to fetch inquiries.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);
    
    const filteredInquiries = useMemo(() => {
        return inquiries
            .filter(i => statusFilter === 'all' || i.status === statusFilter);
    }, [inquiries, statusFilter]);

    const handleMarkAsRead = async (inquiryId: string) => {
        const inquiryRef = doc(db, 'inquiries', inquiryId);
        try {
            await updateDoc(inquiryRef, { status: 'Read' });
            await fetchInquiries(); // Re-fetch to update UI
            toast({
                title: "Success",
                description: "Inquiry marked as read."
            });
        } catch (error) {
            console.error("Error updating inquiry: ", error);
            toast({ title: "Error", description: "Failed to update inquiry.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-primary">Contact Inquiries</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Read">Read</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></TableCell></TableRow>
                            ) : filteredInquiries.length > 0 ? (
                                filteredInquiries.map(inquiry => (
                                    <TableRow key={inquiry.id}>
                                        <TableCell className="font-mono text-xs">
                                            {inquiry.submittedAt ? format(inquiry.submittedAt.toDate(), 'PPpp') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                                        <TableCell>{inquiry.email}</TableCell>
                                        <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={inquiry.status === 'Read' ? 'secondary' : 'success'}>
                                                {inquiry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                           {inquiry.status === 'New' && (
                                                <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(inquiry.id)}>
                                                    <MailCheck className="mr-2 h-4 w-4" />
                                                    Mark Read
                                                </Button>
                                           )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No inquiries found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
