import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, Session } from "@/supabase/client";
import AdminDashboardComponent from "@/components/admin/admin-dashboard";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import type { BlogPost, Note } from "@/types";

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
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({ stats: null, recentPosts: [], pinnedNotes: [] });

  useEffect(() => {
    const checkAuthAndAAL = async () => {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !currentSession) {
        router.replace("/admin/login");
        return;
      }

      setSession(currentSession);

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError || aalData?.currentLevel !== 'aal2') {
        router.replace("/admin/login");
        return;
      }
      setIsLoading(false);

      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

        const [
         { count: totalPosts, error: tpError },
          { count: portfolioSections, error: psError },
          { count: portfolioItems, error: piError },
          { data: recentPostsData, error: rpError },
          { count: pendingTasksCount, error: ptError },
          { count: totalNotesCount, error: tnError },
          { data: pinnedNotesData, error: pnError },
          { data: monthlyTransactionsData, error: mtError },
          // New Queries for enhanced stats
          { data: totalViewsData, error: tvError },
          { count: tasksCompletedCount, error: tcError },
        ] = await Promise.all([
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_sections").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_items").select("*", { count: "exact", head: true }),
          supabase.from("blog_posts").select("id, title, updated_at, slug").order("updated_at", { ascending: false }).limit(3),
          supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("notes").select("id, title, content").eq("is_pinned", true).limit(5),
          supabase.from("transactions").select("type, amount").gte('date', firstDayOfMonth),
        // New Queries execution
          supabase.rpc('get_total_blog_views'),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done").gte("updated_at", startOfWeek),
        ]);

        const errors = [tpError, psError, piError, rpError, ptError, tnError, pnError, mtError, tvError, tcError].filter(Boolean);
        if (errors.length > 0) {
          console.error("Dashboard data fetching errors:", errors);
          throw new Error("Failed to fetch some dashboard data.");
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
            totalPosts: totalPosts || 0,
            portfolioSections: portfolioSections || 0,
            portfolioItems: portfolioItems || 0,
            pendingTasks: pendingTasksCount || 0,
            totalNotes: totalNotesCount || 0,
            monthlyEarnings,
            monthlyExpenses,
            monthlyNet: monthlyEarnings - monthlyExpenses,
            totalBlogViews: totalViewsData || 0,
            tasksCompletedThisWeek: tasksCompletedCount || 0,
          },
          recentPosts: recentPostsData || [],
          pinnedNotes: pinnedNotesData || [],
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    checkAuthAndAAL();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "SIGNED_OUT" || !newSession) {
          router.replace("/admin/login");
        } else if (event === "USER_UPDATED" || event === "TOKEN_REFRESHED" || event === "MFA_CHALLENGE_VERIFIED") {
          checkAuthAndAAL();
        }
      },
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  if (isLoading || !session) {
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
            <div className="mx-auto mb-4 w-12 h-12 animate-spin rounded-full border-4 border-accent border-l-transparent"></div>
            <p className="font-semibold text-slate-200">Loading Dashboard...</p>
          </div>
        </motion.div>
      </Layout>
    );
  }

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