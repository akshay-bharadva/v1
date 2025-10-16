import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, Session } from "@/supabase/client";
import AdminDashboardComponent from "@/components/admin/admin-dashboard";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import type { BlogPost, Note, Transaction, Task } from "@/types";
import { PostgrestError } from '@supabase/supabase-js';

// ... (your DashboardData interface remains the same)
export interface DashboardData {
  stats: {
    totalPosts: number;
    portfolioSections: number;
    portfolioItems: number;
    pendingTasks: number;
    totalNotes: number;
    monthlyEarnings: number;
    monthlyExpenses: number;
    monthlyNet: number;
    totalBlogViews: number;
    tasksCompletedThisWeek: number;
  } | null;
  recentPosts: Pick<BlogPost, "id" | "title" | "updated_at" | "slug">[];
  pinnedNotes: Pick<Note, 'id' | 'title' | 'content'>[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  // We can combine isLoading and session check into one state for clarity
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ stats: null, recentPosts: [], pinnedNotes: [] });

  // Effect 1: Handle initial authentication and data fetching on mount
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // 1. Check for a valid session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !currentSession) {
        setAuthStatus("unauthenticated");
        router.replace("/admin/login");
        return;
      }

      // 2. Check for the required MFA level (aal2)
      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError || aalData?.currentLevel !== 'aal2') {
        // If AAL isn't met, they need to re-authenticate properly
        setAuthStatus("unauthenticated");
        router.replace("/admin/login");
        return;
      }
      
      // 3. If all checks pass, set session and fetch data
      setSession(currentSession);
      setAuthStatus("authenticated");

      try {
        const now = new Date();
        // Correctly get start of week (Sunday)
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        const startOfWeek = new Date(now.setDate(diff)).toISOString();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
          { count: totalPosts },
          { count: portfolioSections },
          { count: portfolioItems },
          { data: recentPostsData, error: rpdError },
          { count: pendingTasksCount },
          { count: totalNotesCount },
          { data: pinnedNotesData, error: pndError },
          { data: monthlyTransactionsData, error: mtdError },
          { data: totalViewsData, error: tvdError },
          { count: tasksCompletedCount },
        ] = await Promise.all([
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_sections").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_items").select("*", { count: "exact", head: true }),
          supabase.from("blog_posts").select("id, title, updated_at, slug").order("updated_at", { ascending: false }).limit(3),
          supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("notes").select("id, title, content").eq("is_pinned", true).limit(5),
          supabase.from("transactions").select("type, amount").gte('date', firstDayOfMonth),
          supabase.rpc('get_total_blog_views'),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done").gte("updated_at", startOfWeek),
        ]);
        
        const potentialErrors = [rpdError, pndError, mtdError, tvdError];
        
        // Use a type guard to filter out nulls and correctly type the resulting array
        const actualErrors = potentialErrors.filter(
          (error): error is PostgrestError => error !== null
        );
        
        if (actualErrors.length > 0) {
            throw new Error(`Failed to fetch dashboard data: ${actualErrors.map(e => e.message).join(', ')}`);
        }

        let monthlyEarnings = 0;
        let monthlyExpenses = 0;
        if (monthlyTransactionsData) {
          for (const t of monthlyTransactionsData) {
            if (t.type === 'earning') monthlyEarnings += t.amount;
            else if (t.type === 'expense') monthlyExpenses += t.amount;
          }
        }

        setDashboardData({
          stats: {
            totalPosts: totalPosts ?? 0,
            portfolioSections: portfolioSections ?? 0,
            portfolioItems: portfolioItems ?? 0,
            pendingTasks: pendingTasksCount ?? 0,
            totalNotes: totalNotesCount ?? 0,
            monthlyEarnings,
            monthlyExpenses,
            monthlyNet: monthlyEarnings - monthlyExpenses,
            totalBlogViews: totalViewsData ?? 0,
            tasksCompletedThisWeek: tasksCompletedCount ?? 0,
          },
          recentPosts: recentPostsData ?? [],
          pinnedNotes: pinnedNotesData ?? [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally, show an error message to the user
      }
    };

    checkAuthAndFetchData();
    // This effect should only run once on component mount.
  }, [router]);


  // Effect 2: Handle real-time auth state changes (like logout)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        // Only act on explicit sign-out or session expiry.
        // Ignore TOKEN_REFRESHED to avoid the AAL issue.
        if (event === "SIGNED_OUT" || !newSession) {
          setAuthStatus("unauthenticated");
          router.replace("/admin/login");
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);


  const handleLogout = async () => {
    setAuthStatus("loading"); // Show loader during sign out
    await supabase.auth.signOut();
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  // Render a loading state until authentication status is determined
  if (authStatus === "loading") {
    return (
      <Layout>
        <motion.div
          key="dashboard-loading"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="flex min-h-screen items-center justify-center bg-zinc-900 font-sans"
        >
          <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-accent border-l-transparent"></div>
            <p className="font-semibold text-slate-200">Verifying Session...</p>
          </div>
        </motion.div>
      </Layout>
    );
  }

  // If authenticated, render the dashboard
  if (authStatus === "authenticated" && session) {
    return (
      <Layout>
        <motion.div
          key="dashboard-content"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          className="font-sans"
        >
          <AdminDashboardComponent onLogout={handleLogout} dashboardData={dashboardData} />
        </motion.div>
      </Layout>
    );
  }

  // Fallback, in practice the redirect should handle this
  return null;
}
