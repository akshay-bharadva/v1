"use client";
import React, { useState, useEffect, useMemo, FormEvent, useCallback } from "react";
import { supabase } from "@/supabase/client";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig, } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, } from "recharts";
import { Edit, Trash2, Calendar as CalendarIcon, Search, TrendingUp, TrendingDown, PiggyBank, Target, Plus, Repeat, } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";

// Chart configuration is static and can be defined outside the component
const chartConfig = {
    earning: { label: "Earnings", color: "hsl(var(--chart-2))" },
    expense: { label: "Expenses", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

// Define a type for the dialog state for better type safety
type DialogState = {
    type: "transaction" | "recurring" | "goal" | "addFunds" | null;
    data?: any;
};

export default function FinanceManager() {
    // --- STATE MANAGEMENT ---
    // All component state is managed here using useState.
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filtering and UI controls
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    // A single state to manage all dialogs (modals)
    const [dialogState, setDialogState] = useState<DialogState>({ type: null });

    // --- DATA FETCHING ---
    const loadAllFinancialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tranRes, goalRes, recurRes] = await Promise.all([
                supabase.from("transactions").select("*").order("date", { ascending: false }),
                supabase.from("financial_goals").select("*").order("target_date"),
                supabase.from("recurring_transactions").select("*").order("start_date")
            ]);

            if (tranRes.error) throw tranRes.error;
            if (goalRes.error) throw goalRes.error;
            if (recurRes.error) throw recurRes.error;

            setTransactions(tranRes.data || []);
            setGoals(goalRes.data || []);
            setRecurring(recurRes.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load financial data.");
            toast.error("Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllFinancialData();
    }, [loadAllFinancialData]);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d",];

    // --- DERIVED DATA & MEMOIZATION ---
    // useMemo is used for expensive calculations to prevent re-computing on every render.
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            const descriptionMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());

            if (!date?.from) return descriptionMatch; // If no date range, just filter by search

            const toDate = date.to ? addDays(date.to, 1) : new Date(8640000000000000); // Far future date if 'to' is not set
            const fromDate = date.from;

            const dateMatch = transactionDate >= fromDate && transactionDate < toDate;

            return descriptionMatch && dateMatch;
        });
    }, [transactions, searchTerm, date]);

    const { totalEarnings, totalExpenses, netIncome, expenseByCategory } =
        useMemo(() => {
            let earnings = 0,
                expenses = 0;
            const categoryMap: Record<string, number> = {};
            for (const t of filteredTransactions) {
                if (t.type === "earning") earnings += t.amount;
                else {
                    expenses += t.amount;
                    const category = t.category || "Uncategorized";
                    categoryMap[category] = (categoryMap[category] || 0) + t.amount;
                }
            }
            const expenseData = Object.entries(categoryMap)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            return {
                totalEarnings: earnings,
                totalExpenses: expenses,
                netIncome: earnings - expenses,
                expenseByCategory: expenseData,
            };
        }, [filteredTransactions]);

    const cashFlowData = useMemo(() => {
        const monthlyData: Record<string, { earning: number; expense: number }> =
            {};
        const sixMonthsAgo = subMonths(new Date(), 5);
        const relevantTransactions = transactions.filter(
            (t) => new Date(t.date) >= startOfMonth(sixMonthsAgo),
        );
        for (const t of relevantTransactions) {
            const month = format(new Date(t.date), "MMM yy");
            if (!monthlyData[month]) monthlyData[month] = { earning: 0, expense: 0 };
            if (t.type === "earning") monthlyData[month].earning += t.amount;
            else monthlyData[month].expense += t.amount;
        }
        return Object.entries(monthlyData)
            .map(([name, values]) => ({ name, ...values }))
            .slice(-6);
    }, [transactions]);

    // --- EVENT HANDLERS ---
    const handleSaveSuccess = () => {
        loadAllFinancialData();
        setDialogState({ type: null }); // Close dialog on success
    };

    const handleDelete = async (tableName: string, id: string, message: string) => {
        if (!confirm(message)) return;
        const { error } = await supabase.from(tableName).delete().eq("id", id);
        if (error) {
            toast.error(`Failed to delete item: ${error.message}`);
        } else {
            toast.success("Item deleted successfully.");
            await loadAllFinancialData();
        }
    };

    const handleAddFunds = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get("amount") as string);
        const goal = dialogState.data as FinancialGoal;

        if (!amount || amount <= 0 || !goal) {
            toast.error("Invalid amount provided.");
            return;
        }

        const newCurrentAmount = goal.current_amount + amount;

        const { error: goalError } = await supabase
            .from("financial_goals")
            .update({ current_amount: newCurrentAmount })
            .eq("id", goal.id);

        if (goalError) {
            toast.error("Failed to update goal", { description: goalError.message });
            return;
        }

        const { error: transError } = await supabase.from("transactions").insert({
            date: new Date().toISOString().split("T")[0],
            description: `Contribution to goal: ${goal.name}`,
            amount: amount,
            type: "expense",
            category: "Savings & Goals",
        });

        if (transError) {
            toast.warning("Goal updated, but failed to create a matching transaction.", {
                description: transError.message,
            });
        } else {
            toast.success(`$${amount.toFixed(2)} added to "${goal.name}"`);
        }

        await handleSaveSuccess();
    };


    // --- RENDER LOGIC ---
    if (isLoading && transactions.length === 0) {
        return <div>Loading financial data...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Finance Dashboard</h2>
                    <p className="text-muted-foreground">
                        Strategic overview, planning, and transaction management.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
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

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Net Income
                                </CardTitle>
                                <TrendingUp className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                    ${netIncome.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    For selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Expenses
                                </CardTitle>
                                <TrendingDown className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${totalExpenses.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    For selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Savings Rate
                                </CardTitle>
                                <PiggyBank className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {totalEarnings > 0
                                        ? `${((netIncome / totalEarnings) * 100).toFixed(1)}%`
                                        : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Net / Gross Income
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Goals</CardTitle>
                                <Target className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{goals.length} Active</div>
                                <p className="text-xs text-muted-foreground">
                                    View in Goals tab
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Cash Flow (Last 6 Months)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-64 w-full">
                                    <BarChart data={cashFlowData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <ChartLegend content={<ChartLegendContent />} />
                                        <Bar
                                            dataKey="earning"
                                            fill="var(--color-earning)"
                                            radius={4}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            fill="var(--color-expense)"
                                            radius={4}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Expense Breakdown</CardTitle>
                                <CardDescription>For selected period</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {expenseByCategory.length > 0 ? (
                                    <ChartContainer config={{}} className="h-64 w-full">
                                        <PieChart>
                                            <Pie
                                                data={expenseByCategory}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                            >
                                                {expenseByCategory.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                content={<ChartTooltipContent nameKey="name" />}
                                            />
                                            <ChartLegend
                                                content={<ChartLegendContent nameKey="name" />}
                                            />
                                        </PieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex h-64 items-center justify-center">
                                        <p className="text-muted-foreground">
                                            No expense data to display.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Goals Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {goals.length > 0 ? (
                                goals.map((goal) => {
                                    const progress = Math.min(
                                        (goal.current_amount / goal.target_amount) * 100,
                                        100,
                                    );
                                    return (
                                        <div key={goal.id}>
                                            <div className="mb-1 flex justify-between">
                                                <p className="font-medium">{goal.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ${goal.current_amount.toLocaleString()} /{" "}
                                                    <span className="font-semibold">
                                                        ${goal.target_amount.toLocaleString()}
                                                    </span>
                                                </p>
                                            </div>
                                            <Progress value={progress} />
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-muted-foreground">
                                    No goals set. Go to the 'Goals' tab to create one.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-6 space-y-4">
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input placeholder="Search descriptions..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal sm:w-auto">
                                        <CalendarIcon className="mr-2 size-4" />
                                        {date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                    <Card>
                        <Table>
                            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="w-[100px] text-center">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{format(new Date(t.date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell className="font-medium">{t.description}</TableCell>
                                            <TableCell>{t.category || "–"}</TableCell>
                                            <TableCell className={`text-right font-bold ${t.type === "earning" ? "text-green-600" : "text-red-600"}`}>{t.type === "earning" ? "+" : "-"}${t.amount.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: "transaction", data: t })}><Edit className="size-4" /></Button>
                                                <Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("transactions", t.id, "Are you sure you want to delete this transaction?")}><Trash2 className="size-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No transactions found for the selected filters.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Recurring Tab */}
                <TabsContent value="recurring">
                    <Card>
                        <CardHeader><CardTitle>Recurring Transactions</CardTitle><CardDescription>Automate your regular income and expenses to forecast cash flow.</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Frequency</TableHead><TableHead>Start Date</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {recurring.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{r.description}</TableCell>
                                            <TableCell className={r.type === "earning" ? "text-green-600" : "text-red-600"}>${r.amount.toFixed(2)}</TableCell>
                                            <TableCell className="capitalize">{r.frequency}</TableCell>
                                            <TableCell>{format(new Date(r.start_date), "MMM dd, yyyy")}</TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: "recurring", data: r })}><Edit className="size-4" /></Button>
                                                <Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("recurring_transactions", r.id, "Delete this rule? This will not delete past transactions.")}><Trash2 className="size-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals">
                    <Card>
                        <CardHeader><CardTitle>Financial Goals</CardTitle><CardDescription>Set targets and track your progress towards them.</CardDescription></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {goals.map((goal) => {
                                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                                return (
                                    <Card key={goal.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-start justify-between" title={`${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}`}>
                                                <CardTitle>{goal.name}</CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-7 text-muted-foreground"><Edit className="size-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => setDialogState({ type: "goal", data: goal })}>Edit Goal</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500" onClick={() => handleDelete("financial_goals", goal.id, "Delete this goal? This does not affect past transactions.")}>Delete Goal</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <CardDescription>${goal.current_amount.toLocaleString()} / <b>${goal.target_amount.toLocaleString()}</b></CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            {/* <Progress value={progress} /> */}
                                        </CardContent>
                                        <CardFooter><Button size="sm" onClick={() => setDialogState({ type: "addFunds", data: goal })}><Plus className="mr-2 size-4" /> Add Funds</Button></CardFooter>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs / Modals */}
            <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
                <DialogContent>
                    {dialogState.type === "transaction" && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Add"} Transaction</DialogTitle></DialogHeader><TransactionForm transaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === "recurring" && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Add"} Recurring Rule</DialogTitle></DialogHeader><RecurringTransactionForm recurringTransaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === "goal" && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Create"} Financial Goal</DialogTitle></DialogHeader><FinancialGoalForm goal={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === "addFunds" && (
                        <>
                            <DialogHeader><DialogTitle>Add Funds to "{dialogState.data?.name}"</DialogTitle></DialogHeader>
                            <form onSubmit={handleAddFunds} className="space-y-4 pt-4">
                                <div>
                                    <Label htmlFor="add-funds-amount">Amount</Label>
                                    <Input id="add-funds-amount" name="amount" type="number" step="0.01" required autoFocus />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                                    <Button type="submit">Confirm Contribution</Button>
                                </div>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}