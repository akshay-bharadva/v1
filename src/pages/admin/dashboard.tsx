/*
This file for the admin dashboard page is updated for the new design.
- The loading state is simplified to a cleaner, more minimal spinner, removing the neo-brutalist box.
- The main layout component no longer needs a specific `font-space` class, as `font-sans` is now the global default.
- The `Layout` component is retained to provide consistent page structure (header/footer, etc.), even for the admin area.
*/
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase, Session } from "@/supabase/client";
import AdminDashboardComponent from "@/components/admin/admin-dashboard";
import { motion } from "framer-motion";
import Layout from "@/components/layout";
import type { BlogPost, Note } from "@/types";
import { Loader2 } from "lucide-react";

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
  pinnedNotes: Pick<Note, "id" | "title" | "content">[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    recentPosts: [],
    pinnedNotes: [],
  });

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
      
      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();

        const [{ count: totalPosts }, { count: portfolioSections }, { count: portfolioItems }, { data: recentPostsData }, { count: pendingTasksCount }, { count: totalNotesCount }, { data: pinnedNotesData }, { data: monthlyTransactionsData }, { data: totalViewsData }, { count: tasksCompletedCount }] = await Promise.all([
          supabase.from("blog_posts").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_sections").select("*", { count: "exact", head: true }),
          supabase.from("portfolio_items").select("*", { count: "exact", head: true }),
          supabase.from("blog_posts").select("id, title, updated_at, slug").order("updated_at", { ascending: false }).limit(3),
          supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
          supabase.from("notes").select("*", { count: "exact", head: true }),
          supabase.from("notes").select("id, title, content").eq("is_pinned", true).limit(3),
          supabase.from("transactions").select("type, amount").gte('date', firstDayOfMonth),
          supabase.rpc('get_total_blog_views'),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done").gte("updated_at", startOfWeek),
        ]);

        let monthlyEarnings = 0;
        let monthlyExpenses = 0;
        monthlyTransactionsData?.forEach(t => {
            if (t.type === 'earning') monthlyEarnings += t.amount;
            else if (t.type === 'expense') monthlyExpenses += t.amount;
        });

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
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndAAL();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "SIGNED_OUT" || !newSession) {
          router.replace("/admin/login");
        } else if (["USER_UPDATED", "TOKEN_REFRESHED", "MFA_CHALLENGE_VERIFIED"].includes(event)) {
          checkAuthAndAAL();
        }
      },
    );

    return () => { authListener?.subscription?.unsubscribe(); };
  }, [router]);

  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  if (isLoading || !session) {
    return (
      <Layout>
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        key="dashboard-content"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AdminDashboardComponent onLogout={handleLogout} dashboardData={dashboardData} />
      </motion.div>
    </Layout>
  );
}