/*
This file is updated for consistency with the new kinetic typography design.
- The component already uses the UI kit, so changes are minimal and focus on alignment with the dark theme.
- Chart colors in `chartConfig` are updated to use the new CSS variables for 'accent' and 'destructive', ensuring they are theme-aware.
- The overall layout and structure are preserved as they are already modern and functional.
- Removed explicit text color classes (e.g., `text-green-600`) in favor of semantic colors that will adapt to the theme (e.g., `text-accent`, `text-destructive`).
*/
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/supabase/client";
import type { Transaction } from "@/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import { Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";

const chartConfig = {
  earning: { label: "Earnings", color: "hsl(var(--accent))" },
  expense: { label: "Expenses", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;

export default function FinanceManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase.from("transactions").select("*").order("date", { ascending: false });
    if (fetchError) setError(fetchError.message);
    else setTransactions(data || []);
    setIsLoading(false);
  };

  useEffect(() => { loadTransactions(); }, []);

  const { totalEarnings, totalExpenses, netSavings, monthlyData } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthTransactions = transactions.filter(t => { const tDate = new Date(t.date); return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear; });
    const totalEarnings = currentMonthTransactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(currentYear, currentMonth - i, 1);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        const monthTransactions = transactions.filter(t => { const tDate = new Date(t.date); return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === year; });
        return { name: `${month} '${String(year).slice(-2)}`, earning: monthTransactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + t.amount, 0), expense: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), };
    }).reverse();
    return { totalEarnings, totalExpenses, netSavings: totalEarnings - totalExpenses, monthlyData };
  }, [transactions]);
  
  const handleEdit = (transaction: Transaction) => { setEditingTransaction(transaction); setIsDialogOpen(true); }
  const handleDelete = async (id: string) => { if (!confirm("Delete this transaction?")) return; await supabase.from("transactions").delete().eq("id", id); loadTransactions(); }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold">Finance Dashboard</h2>
                <p className="text-muted-foreground">Track your earnings and expenses.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button onClick={() => setEditingTransaction(null)}><PlusCircle className="mr-2 size-4"/> Add Transaction</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingTransaction ? "Edit" : "Add"} Transaction</DialogTitle></DialogHeader>
                    <TransactionForm transaction={editingTransaction} onSuccess={() => { setIsDialogOpen(false); loadTransactions(); }} />
                </DialogContent>
            </Dialog>
        </div>

        <Tabs defaultValue="dashboard">
            <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="mt-4 space-y-6">
                 <div className="grid gap-4 md:grid-cols-3">
                    <Card><CardHeader><CardTitle className="text-sm font-medium">This Month's Earnings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-accent">${totalEarnings.toFixed(2)}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">This Month's Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-destructive">${totalExpenses.toFixed(2)}</p></CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm font-medium">This Month's Net</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-foreground' : 'text-destructive'}`}>${netSavings.toFixed(2)}</p></CardContent></Card>
                </div>
                <Card>
                    <CardHeader><CardTitle>Last 6 Months Overview</CardTitle></CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} cursor={false}/>
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="earning" fill="var(--color-earning)" radius={4} />
                                <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="all" className="mt-4">
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[100px]">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {isLoading && <TableRow><TableCell colSpan={5} className="text-center p-8"><Loader2 className="mx-auto size-6 animate-spin text-muted-foreground"/></TableCell></TableRow>}
                                {transactions.map(t => (
                                    <TableRow key={t.id}>
                                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-medium">{t.description}</TableCell>
                                        <TableCell>{t.category || '-'}</TableCell>
                                        <TableCell className={`text-right font-bold ${t.type === 'earning' ? 'text-accent' : 'text-destructive'}`}>{t.type === 'earning' ? '+' : '-'}${t.amount.toFixed(2)}</TableCell>
                                        <TableCell className="flex gap-1"><Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(t)}><Edit className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="size-4"/></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}