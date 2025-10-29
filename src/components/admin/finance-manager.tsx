"use client";
import React, { useState, useEffect, useMemo, FormEvent } from "react";
import { motion } from "framer-motion";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import { CalendarIcon, Edit, Plus, Repeat, Search, Target, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Progress } from "../ui/progress";
import { Label } from "../ui/label";
import FinancialGoalForm from "./financial-goal-form";
import RecurringTransactionForm from "./recurring-transaction-form";

const chartConfig = {
    earning: { label: "Earnings", color: "hsl(var(--chart-2))" },
    expense: { label: "Expenses", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export default function FinanceManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });
    const [dialogState, setDialogState] = useState<{
        type: "transaction" | "recurring" | "goal" | "addFunds" | null;
        data?: any;
    }>({ type: null });

    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            const descriptionMatch = t.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            let dateMatch = true;
            if (date?.from) {
                dateMatch = transactionDate >= date.from;
            }
            if (date?.to) {
                dateMatch = transactionDate <= addDays(date.to, 1);
            }
            return descriptionMatch && dateMatch;
        });
    }, [transactions, searchTerm, date]);

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

        const currentMonthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const totalEarnings = currentMonthTransactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + t.amount, 0);
        const totalExpenses = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const monthlyData = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(currentYear, currentMonth - i, 1);
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();

            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === year;
            });

            return {
                name: `${month} '${String(year).slice(-2)}`,
                earning: monthTransactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + t.amount, 0),
                expense: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
            };
        }).reverse();

        return { totalEarnings, totalExpenses, netSavings: totalEarnings - totalExpenses, monthlyData };
    }, [transactions]);

    const loadAllFinancialData = async () => {
        setIsLoading(true);
        const [tranRes, goalRes, recurRes] = await Promise.all([
            supabase
                .from("transactions")
                .select("*")
                .order("date", { ascending: false }),
            supabase.from("financial_goals").select("*").order("target_date"),
            supabase.from("recurring_transactions").select("*").order("start_date")
        ]);
        if (tranRes.error || goalRes.error || recurRes.error) {
            setError(tranRes.error?.message || "Failed to load data");
        } else {
            setTransactions(tranRes.data || []);
            setGoals(goalRes.data || []);
            setRecurring(recurRes.data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadAllFinancialData();
    }, []);


    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsDialogOpen(true);
    }

    const handleSaveSuccess = async () => {
        await loadAllFinancialData();
        setDialogState({ type: null });
    };
    const handleDeleteTransaction = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;
        await supabase.from("transactions").delete().eq("id", id);
        await loadAllFinancialData();
    };
    const handleDeleteRecurring = async (id: string) => {
        if (!confirm("Delete this rule? This will not delete past transactions."))
            return;
        await supabase.from("recurring_transactions").delete().eq("id", id);
        await loadAllFinancialData();
    };
    const handleDeleteGoal = async (id: string) => {
        if (!confirm("Delete this goal? This does not affect past transactions."))
            return;
        await supabase.from("financial_goals").delete().eq("id", id);
        await loadAllFinancialData();
    };
    const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);
        const goal = dialogState.data as FinancialGoal;
        if (!amount || !goal) return;
        const newCurrentAmount = goal.current_amount + amount;
        const { error: goalError } = await supabase
            .from("financial_goals")
            .update({ current_amount: newCurrentAmount })
            .eq("id", goal.id);
        if (goalError) {
            toast.error("Failed to update goal:", { description: goalError.message });
            return;
        }
        const { error: transError } = await supabase
            .from("transactions")
            .insert({
                date: new Date().toISOString().split("T")[0],
                description: `Contribution to goal: ${goal.name}`,
                amount: amount,
                type: "expense",
                category: "Savings & Goals",
            });
        if (transError) {
            toast.error("Goal updated, but failed to create transaction.", {
                description: transError.message,
            });
        }
        toast.success(`$${amount} added to "${goal.name}"`);
        await handleSaveSuccess();
    };

    return (
        <div className="space-y-6 ">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Finance Dashboard</h2>
                    <p className="text-muted-foreground">
                        Strategic overview, planning, and transaction management.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setDialogState({ type: "goal" })}>
                        <Target className="mr-2 size-4" /> New Goal
                    </Button>
                    <Button onClick={() => setDialogState({ type: "recurring" })}>
                        <Repeat className="mr-2 size-4" /> New Recurring
                    </Button>
                    <Button onClick={() => setDialogState({ type: "transaction" })}>
                        <Plus className="mr-2 size-4" /> New Transaction
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="recurring">Recurring</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card><CardHeader><CardTitle>This Month's Earnings</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p></CardContent></Card>
                        <Card><CardHeader><CardTitle>This Month's Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p></CardContent></Card>
                        <Card><CardHeader><CardTitle>This Month's Net</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>${netSavings.toFixed(2)}</p></CardContent></Card>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Last 6 Months Overview</CardTitle></CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                <BarChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar dataKey="earning" fill="var(--color-earning)" radius={4} />
                                    <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="transactions" className="mt-6 space-y-4">
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search descriptions..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className="w-full justify-start text-left font-normal sm:w-auto"
                                    >
                                        <CalendarIcon className="mr-2 size-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="w-[100px] text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                {format(new Date(t.date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {t.description}
                                            </TableCell>
                                            <TableCell>{t.category || "–"}</TableCell>
                                            <TableCell
                                                className={`text-right font-bold ${t.type === "earning" ? "text-green-600" : "text-red-600"}`}
                                            >
                                                {t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}
                                            </TableCell>
                                            {/* --- THIS IS THE CORRECTED PART --- */}
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() =>
                                                        setDialogState({ type: "transaction", data: t })
                                                    }
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDeleteTransaction(t.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No transactions found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
                <TabsContent value="recurring">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recurring Transactions</CardTitle>
                            <CardDescription>
                                Automate your regular income and expenses to forecast cash flow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recurring.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">
                                                {r.description}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    r.type === "earning"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                }
                                            >
                                                ${r.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {r.frequency}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(r.start_date), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() =>
                                                        setDialogState({ type: "recurring", data: r })
                                                    }
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDeleteRecurring(r.id)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="goals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Goals</CardTitle>
                            <CardDescription>
                                Set targets and track your progress towards them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {goals.map((goal) => {
                                const progress = Math.min((goal.current_amount / goal.target_amount) * 100,100,);
                                return (
                                    <Card key={goal.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle>{goal.name}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-7 -mt-2 -mr-2 text-muted-foreground"
                                                        >
                                                            <Edit className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setDialogState({ type: "goal", data: goal })
                                                            }
                                                        >
                                                            Edit Goal
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-500"
                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                        >
                                                            Delete Goal
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CardDescription>
                                                ${goal.current_amount.toLocaleString()} /
                                                <b>${goal.target_amount.toLocaleString()}</b>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <Progress value={progress} />
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                size="sm"
                                                onClick={() => setDialogState({ type: "addFunds", data: goal })}
                                            >
                                                <Plus className="mr-2 size-4" />
                                                Add Funds
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <Dialog
                    open={!!dialogState.type}
                    onOpenChange={(open) => !open && setDialogState({ type: null })}
                >
                    <DialogContent>
                        {dialogState.type === "transaction" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        {dialogState.data ? "Edit" : "Add"} Transaction
                                    </DialogTitle>
                                </DialogHeader>
                                <TransactionForm
                                    transaction={dialogState.data}
                                    onSuccess={handleSaveSuccess}
                                />
                            </>
                        )}
                        {dialogState.type === "recurring" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        {dialogState.data ? "Edit" : "Add"} Recurring Rule
                                    </DialogTitle>
                                </DialogHeader>
                                <RecurringTransactionForm
                                    recurringTransaction={dialogState.data}
                                    onSuccess={handleSaveSuccess}
                                />
                            </>
                        )}
                        {dialogState.type === "goal" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        {dialogState.data ? "Edit" : "Create"} Financial Goal
                                    </DialogTitle>
                                </DialogHeader>
                                <FinancialGoalForm
                                    goal={dialogState.data}
                                    onSuccess={handleSaveSuccess}
                                />
                            </>
                        )}
                        {dialogState.type === "addFunds" && (
                            <>
                                <DialogHeader>
                                    <DialogTitle>
                                        Add Funds to "{dialogState.data?.name}"
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleAddFunds} className="space-y-4 pt-4">
                                    <div>
                                        <Label htmlFor="add-funds-amount">Amount</Label>
                                        <Input
                                            id="add-funds-amount"
                                            name="amount"
                                            type="number"
                                            step="1"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <DialogClose asChild>
                                            <Button variant="ghost">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">Confirm Contribution</Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </Tabs>
        </div>
    );
}