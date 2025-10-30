"use client";
import React, { useState, useEffect, useMemo, FormEvent, useCallback } from "react";
import { supabase } from "@/supabase/client";
import type { FinancialGoal, RecurringTransaction, Transaction } from "@/types";
import { DateRange } from "react-day-picker";
import { addDays, addMonths, addWeeks, addYears, format, startOfMonth, subMonths, differenceInDays, isBefore, isAfter, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, } from "@/components/ui/dialog";
import TransactionForm from "@/components/admin/transaction-form";
import RecurringTransactionForm from "@/components/admin/recurring-transaction-form";
import FinancialGoalForm from "@/components/admin/financial-goal-form";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig, } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, RadialBar, RadialBarChart } from "recharts";
import { Edit, Trash2, Calendar as CalendarIcon, Search, TrendingUp, TrendingDown, PiggyBank, Target, Plus, Repeat, AlertCircle, } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const chartConfig = { earning: { label: "Earnings", color: "hsl(var(--chart-2))" }, expense: { label: "Expenses", color: "hsl(var(--chart-5))" } };
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
type DialogState = { type: "transaction" | "recurring" | "goal" | "addFunds" | null; data?: any; };

const GoalCard = ({ goal, onAddFunds, onEdit, onDelete }: { goal: FinancialGoal, onAddFunds: () => void, onEdit: () => void, onDelete: () => void }) => {
    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remainingAmount = goal.target_amount - goal.current_amount;
    const remainingDays = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;

    return (
        <Card className="relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            {/* The background fill that represents progress */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-primary/10 -z-0"
                initial={{ height: 0 }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            {/* All content sits above the fill effect */}
            <div className="relative z-10 flex h-full flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="leading-tight">{goal.name}</CardTitle>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-7 text-muted-foreground"><Edit className="size-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={onEdit}>Edit Goal</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={onDelete}>Delete Goal</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-grow flex-col justify-between text-center">
                    {/* Top part: Big percentage and saved/target text */}
                    <div>
                        <p className="text-6xl font-black text-primary/80">{progress.toFixed(0)}<span className="text-4xl text-primary/50">%</span></p>
                        <p className="font-semibold text-muted-foreground">
                            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                        </p>
                    </div>

                    {/* Bottom part: Remaining stats */}
                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Remaining</p>
                            <p className="text-lg font-bold text-foreground">
                                ${remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}
                            </p>
                        </div>
                        <div className="space-y-1 rounded-md bg-background/50 p-2">
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Time Left</p>
                            {remainingDays !== null ? (
                                <p className={`text-lg font-bold ${remainingDays < 0 ? 'text-destructive' : 'text-foreground'}`}>
                                    {remainingDays < 0 ? `Overdue` : `${remainingDays}d`}
                                </p>
                            ) : (
                                <p className="text-lg font-bold text-foreground">-</p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button size="sm" className="w-full" onClick={onAddFunds}><Plus className="mr-2 size-4" />Add Funds</Button>
                </CardFooter>
            </div>
        </Card>
    );
};

export default function FinanceManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [date, setDate] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: new Date() });
    const [dialogState, setDialogState] = useState<DialogState>({ type: null });
    const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());

     const processRecurringTransactions = useCallback(async (rules: RecurringTransaction[]) => {
        const newTransactions: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[] = [];
        const rulesToUpdate: { id: string; last_processed_date: string }[] = [];
        const today = new Date();
    
        for (const rule of rules) {
            let cursor = rule.last_processed_date ? new Date(rule.last_processed_date) : new Date(rule.start_date);
            // Move cursor to the next potential occurrence after the last processed date
            if (rule.last_processed_date) {
                switch (rule.frequency) {
                    case 'daily': cursor = addDays(cursor, 1); break;
                    case 'weekly': cursor = addWeeks(cursor, 1); break;
                    case 'monthly': cursor = addMonths(cursor, 1); break;
                    case 'yearly': cursor = addYears(cursor, 1); break;
                }
            }

            // Ensure cursor doesn't start before the rule's actual start date
            if (isBefore(cursor, new Date(rule.start_date))) {
                cursor = new Date(rule.start_date);
            }

            const ruleEndDate = rule.end_date ? new Date(rule.end_date) : null;
            let lastProcessedThisRun: Date | null = null;
    
            while (isBefore(cursor, today) || isSameDay(cursor, today)) {
                if (ruleEndDate && isAfter(cursor, ruleEndDate)) break;
    
                newTransactions.push({
                    date: format(cursor, 'yyyy-MM-dd'),
                    description: rule.description,
                    amount: rule.amount,
                    type: rule.type,
                    category: rule.category,
                    recurring_transaction_id: rule.id,
                });
                lastProcessedThisRun = cursor;
    
                switch (rule.frequency) {
                    case 'daily': cursor = addDays(cursor, 1); break;
                    case 'weekly': cursor = addWeeks(cursor, 1); break;
                    case 'monthly': cursor = addMonths(cursor, 1); break;
                    case 'yearly': cursor = addYears(cursor, 1); break;
                }
            }
            if (lastProcessedThisRun) {
                rulesToUpdate.push({ id: rule.id, last_processed_date: format(lastProcessedThisRun, 'yyyy-MM-dd') });
            }
        }
    
        if (newTransactions.length > 0) {
            const { error: insertError } = await supabase.from('transactions').insert(newTransactions);
            if (insertError) { toast.error("Auto-log failed", { description: insertError.message }); return false; }
            
            const { error: updateError } = await supabase.from('recurring_transactions').upsert(rulesToUpdate);
            if (updateError) { toast.warning("Transactions logged, but failed to update rule status.", { description: updateError.message }); }
            
            toast.success(`${newTransactions.length} recurring transaction(s) automatically logged.`);
            return true;
        }
        return false;
    }, []);

    const loadAllFinancialData = useCallback(async () => {
        setIsLoading(true); setError(null);
        try {
            const [tranRes, goalRes, recurRes] = await Promise.all([
                supabase.from("transactions").select("*").order("date", { ascending: false }),
                supabase.from("financial_goals").select("*").order("target_date"),
                supabase.from("recurring_transactions").select("*").order("start_date")
            ]);

            if (tranRes.error || goalRes.error || recurRes.error) throw new Error(tranRes.error?.message || "Failed to load data");

            const wasUpdated = await processRecurringTransactions(recurRes.data || []);

            if (wasUpdated) {
                const finalTranRes = await supabase.from("transactions").select("*").order("date", { ascending: false });
                setTransactions(finalTranRes.data || []);
            } else { setTransactions(tranRes.data || []); }

            setGoals(goalRes.data || []); setRecurring(recurRes.data || []);
        } catch (err: any) {
            setError(err.message); toast.error("Error", { description: err.message });
        } finally { setIsLoading(false); }
    }, [processRecurringTransactions]);

    useEffect(() => { loadAllFinancialData(); }, [loadAllFinancialData]);

    // --- DERIVED DATA & MEMOIZATION ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const transactionDate = new Date(t.date);
            const descriptionMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            if (!date?.from) return descriptionMatch;
            const toDate = date.to ? addDays(date.to, 1) : new Date(8640000000000000);
            const dateMatch = transactionDate >= date.from && transactionDate < toDate;
            return descriptionMatch && dateMatch;
        });
    }, [transactions, searchTerm, date]);

    const { totalEarnings, totalExpenses, netIncome, expenseByCategory } = useMemo(() => {
        let earnings = 0, expenses = 0; const categoryMap: Record<string, number> = {};
        for (const t of filteredTransactions) {
            if (t.type === "earning") earnings += t.amount;
            else { expenses += t.amount; const category = t.category || "Uncategorized"; categoryMap[category] = (categoryMap[category] || 0) + t.amount; }
        }
        const expenseData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        return { totalEarnings: earnings, totalExpenses: expenses, netIncome: earnings - expenses, expenseByCategory: expenseData };
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
    const analyticsData = useMemo(() => {
        const monthlyData: Record<string, { income: number; expenses: number; net: number }> = {};
        const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === analyticsYear);

        for (const t of yearTransactions) {
            const month = format(new Date(t.date), 'MMM');
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0, net: 0 };
            if (t.type === 'earning') {
                monthlyData[month].income += t.amount;
            } else {
                monthlyData[month].expenses += t.amount;
            }
        }

        for (const month in monthlyData) {
            monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
        }

        const allMonths = Array.from({ length: 12 }, (_, i) => format(new Date(analyticsYear, i), 'MMM'));
        return allMonths.map(month => ({
            month,
            ...(monthlyData[month] || { income: 0, expenses: 0, net: 0 })
        }));
    }, [transactions, analyticsYear]);
    // --- EVENT HANDLERS ---
    const handleSaveSuccess = () => { loadAllFinancialData(); setDialogState({ type: null }); };
    const handleDelete = async (tableName: string, id: string, message: string) => { if (!confirm(message)) return; const { error } = await supabase.from(tableName).delete().eq("id", id); if (error) { toast.error(`Failed to delete: ${error.message}`); } else { toast.success("Item deleted."); await loadAllFinancialData(); } };
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
    // --- NEW: Forecast Calculation ---
    const forecast = useMemo(() => {
        let upcomingIncome = 0;
        let upcomingExpenses = 0;
        const today = new Date();
        const next30Days = addDays(today, 30);

        recurring.forEach(rule => {
            let cursor = rule.last_processed_date ? new Date(rule.last_processed_date) : new Date(rule.start_date);
            if (rule.last_processed_date) {
                switch (rule.frequency) {
                    case 'daily': cursor = addDays(cursor, 1); break;
                    case 'weekly': cursor = addWeeks(cursor, 1); break;
                    case 'monthly': cursor = addMonths(cursor, 1); break;
                    case 'yearly': cursor = addYears(cursor, 1); break;
                }
            }
            if (isBefore(cursor, new Date(rule.start_date))) cursor = new Date(rule.start_date);

            const ruleEndDate = rule.end_date ? new Date(rule.end_date) : null;

            while (isBefore(cursor, next30Days)) {
                if (ruleEndDate && isAfter(cursor, ruleEndDate)) break;
                if (isAfter(cursor, today) || isSameDay(cursor, today)) {
                    if (rule.type === 'earning') upcomingIncome += rule.amount;
                    else upcomingExpenses += rule.amount;
                }
                switch (rule.frequency) {
                    case 'daily': cursor = addDays(cursor, 1); break;
                    case 'weekly': cursor = addWeeks(cursor, 1); break;
                    case 'monthly': cursor = addMonths(cursor, 1); break;
                    case 'yearly': cursor = addYears(cursor, 1); break;
                }
            }
        });

        return { upcomingIncome, upcomingExpenses };
    }, [recurring]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold">Finance Command Center</h2><p className="text-muted-foreground">Strategic overview, planning, and transaction management.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setDialogState({ type: "goal" })}> <Target className="mr-2 size-4" /> New Goal</Button><Button onClick={() => setDialogState({ type: "recurring" })}> <Repeat className="mr-2 size-4" /> New Recurring</Button><Button onClick={() => setDialogState({ type: "transaction" })}> <Plus className="mr-2 size-4" /> New Transaction</Button></div></div>
            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-5"><TabsTrigger value="dashboard">Dashboard</TabsTrigger><TabsTrigger value="transactions">Transactions</TabsTrigger><TabsTrigger value="recurring">Recurring</TabsTrigger><TabsTrigger value="goals">Goals</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>
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
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Next 30-Day Forecast</CardTitle>
                            <AlertCircle className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">+${forecast.upcomingIncome.toFixed(2)}</div>
                            <div className="text-2xl font-bold text-red-600">-${forecast.upcomingExpenses.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Based on recurring transactions</p>
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

                <TabsContent value="recurring">
                    <Card>
                        <CardHeader><CardTitle>Recurring Transactions</CardTitle><CardDescription>Automate your regular income and expenses to forecast cash flow. Due transactions are logged automatically.</CardDescription></CardHeader>
                        <CardContent><Table>
                            <TableHeader><TableRow><TableHead>Description</TableHead><TableHead>Amount</TableHead><TableHead>Frequency</TableHead><TableHead>Start Date</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {recurring.map((r) => (<TableRow key={r.id}><TableCell className="font-medium">{r.description}</TableCell><TableCell className={r.type === 'earning' ? 'text-green-600' : 'text-red-600'}>${r.amount.toFixed(2)}</TableCell><TableCell className="capitalize">{r.frequency}</TableCell><TableCell>{format(new Date(r.start_date), "MMM dd, yyyy")}</TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" className="size-8" onClick={() => setDialogState({ type: 'recurring', data: r })}><Edit className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete("recurring_transactions", r.id, `Delete rule "${r.description}"?`)}><Trash2 className="size-4" /></Button></TableCell></TableRow>))}
                                {recurring.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">No recurring transaction rules found.</TableCell></TableRow>}
                            </TableBody>
                        </Table></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    <Card><CardHeader><CardTitle>Financial Goals</CardTitle><CardDescription>Set targets and track your progress towards them.</CardDescription></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {goals.map((goal) => (
                                <GoalCard key={goal.id} goal={goal}
                                    onAddFunds={() => setDialogState({ type: 'addFunds', data: goal })}
                                    onEdit={() => setDialogState({ type: 'goal', data: goal })}
                                    onDelete={() => handleDelete("financial_goals", goal.id, `Delete goal "${goal.name}"?`)}
                                />
                            ))}
                            {goals.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">No goals set yet. Click "New Goal" to start planning.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <div>
                                <CardTitle>Annual Report</CardTitle>
                                <CardDescription>Month-by-month financial summary for the selected year.</CardDescription>
                            </div>
                            <Select value={String(analyticsYear)} onValueChange={(v) => setAnalyticsYear(Number(v))}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead className="text-right text-green-600">Income</TableHead>
                                        <TableHead className="text-right text-red-600">Expenses</TableHead>
                                        <TableHead className="text-right">Net Income</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData.map(row => (
                                        <TableRow key={row.month}>
                                            <TableCell className="font-medium">{row.month}</TableCell>
                                            <TableCell className="text-right text-green-600">+${row.income.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-red-600">-${row.expenses.toFixed(2)}</TableCell>
                                            <TableCell className={`text-right font-bold ${row.net >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                                                {row.net < 0 ? '-' : ''}${Math.abs(row.net).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
                <DialogContent>
                    {dialogState.type === 'transaction' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Add"} Transaction</DialogTitle></DialogHeader><TransactionForm transaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === 'recurring' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Create"} Recurring Rule</DialogTitle></DialogHeader><RecurringTransactionForm recurringTransaction={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === 'goal' && (<><DialogHeader><DialogTitle>{dialogState.data ? "Edit" : "Create"} Financial Goal</DialogTitle></DialogHeader><FinancialGoalForm goal={dialogState.data} onSuccess={handleSaveSuccess} /></>)}
                    {dialogState.type === 'addFunds' && (<><DialogHeader><DialogTitle>Add Funds to "{dialogState.data?.name}"</DialogTitle></DialogHeader><form onSubmit={handleAddFunds} className="space-y-4 pt-4"><div><Label htmlFor="add-funds-amount">Amount</Label><Input id="add-funds-amount" name="amount" type="number" step="1" required autoFocus /></div><div className="flex justify-end gap-2"><DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose><Button type="submit">Confirm Contribution</Button></div></form></>)}
                </DialogContent>
            </Dialog>
        </div>
    );
}