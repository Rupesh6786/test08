
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const revenueByMonthData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 8000 },
];

const topTournamentsData = [
  { name: "The Grand Clash", revenue: 10000 },
  { name: "Weekend Warriors Cup", revenue: 5000 },
  { name: "Booyah Bonanza", revenue: 4000 },
  { name: "Free Fire Frenzy", revenue: 3000 },
];

const recentPaymentsData = [
  { id: "pay_1", player: "GamerXpert", tournament: "The Grand Clash", amount: 100, status: "Confirmed", date: "2024-08-10" },
  { id: "pay_2", player: "SniperQueen", tournament: "Weekend Warriors Cup", amount: 50, status: "Confirmed", date: "2024-08-15" },
  { id: "pay_3", player: "ClutchGod", tournament: "Free Fire Frenzy", amount: 30, status: "Confirmed", date: "2024-08-16" },
  { id: "pay_4", player: "RushHour", tournament: "Booyah Bonanza", amount: 40, status: "Pending", date: "2024-08-01" },
];

export default function RevenuePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary">Revenue</h1>
        <Button><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }} 
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Grossing Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTournamentsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>A list of recent payments from players.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Tournament</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPaymentsData.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.player}</TableCell>
                  <TableCell>{payment.tournament}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={payment.status === 'Confirmed' ? 'success' : 'secondary'}>{payment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
