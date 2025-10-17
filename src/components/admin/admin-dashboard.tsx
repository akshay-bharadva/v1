// The admin dashboard is updated to match the dark theme for consistency.
// - Backgrounds are changed to dark colors (e.g., bg-zinc-900).
// - Text is changed to light colors (e.g., text-slate-200).
// - Borders are made more subtle (e.g., border-zinc-700).
// - The font is changed from 'font-space' to the default 'font-sans' (Inter).

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogManager from "@/components/admin/blog-manager";
import ContentManager from "@/components/admin/content-manager";
import SecuritySettings from "@/components/admin/security-settings";
import TaskManager from "@/components/admin/tasks-manager";
import NotesManager from "@/components/admin/notes-manager";
import FinanceManager from "@/components/admin/finance-manager";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, BarChart2, ExternalLink, ListTodo, StickyNote, Banknote, TrendingUp, TrendingDown, CheckCircle, Eye } from "lucide-react";
import Link from "next/link";
import { DashboardData } from "@/pages/admin/dashboard";

interface AdminDashboardProps {
  onLogout: () => void;
  dashboardData: DashboardData;
}

type ActiveTab = "blogs" | "content" | "security" | "dashboard" | "tasks" | "notes" | "finance";
type InitialAction = "createBlogPost" | "createPortfolioSection" | null;

export default function AdminDashboard({ onLogout, dashboardData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [initialAction, setInitialAction] = useState<InitialAction>(null);

  useEffect(() => {
    const checkMfaStatus = async () => {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") {
        setIsMfaEnabled(true);
      } else {
        setIsMfaEnabled(false);
      }
    };
    checkMfaStatus();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Overview", icon: "📊" },
    { id: "blogs", label: "Blog Posts", icon: "📝" },
    { id: "content", label: "Website Content", icon: "🏠" },
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "notes", label: "Notes", icon: "🗒️" },
    { id: "finance", label: "Finance", icon: "💰" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  const StatCard: React.FC<{ title: string; value: string | number; icon?: JSX.Element, bgColor?: string }> = ({ title, value, icon, bgColor = "bg-zinc-800" }) => (
    <div className={`rounded-lg border border-zinc-700 p-4 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</h3>
        {icon && <div className="text-zinc-500">{icon}</div>}
      </div>
      <p className="mt-1 text-3xl font-black text-slate-100">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-slate-200 font-sans">
      <header className="border-b border-zinc-700 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">Admin Dashboard</h1>
            <div className="flex w-full items-center justify-between sm:w-auto sm:justify-end sm:space-x-4">
              {isMfaEnabled && (
                <span className="rounded-md border border-green-500/50 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-300 sm:text-sm">
                  🔒 MFA Enabled
                </span>
              )}
              <Button onClick={onLogout} variant="destructive">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex flex-wrap gap-1 border-b border-zinc-700 pb-px sm:space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 rounded-t-md border-x border-t px-3 py-2 text-sm font-bold sm:px-4
                  ${activeTab === tab.id
                    ? "border-zinc-700 bg-zinc-800 text-slate-100"
                    : "border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-slate-200"
                  } transition-colors`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "dashboard" && (
          <motion.section
            key="dashboard-overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="mb-4 text-2xl font-black text-slate-100">This Month's Summary</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {!dashboardData.stats ? (
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg border border-zinc-700 bg-zinc-800"></div>)
                ) : (
                  <>
                    <StatCard title="Monthly Earnings" value={dashboardData.stats.monthlyEarnings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<TrendingUp />} bgColor="bg-green-900/20 border-green-500/30" />
                    <StatCard title="Monthly Expenses" value={dashboardData.stats.monthlyExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<TrendingDown />} bgColor="bg-red-900/20 border-red-500/30" />
                    <StatCard title="Monthly Net" value={dashboardData.stats.monthlyNet.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={<Banknote />} bgColor={dashboardData.stats.monthlyNet >= 0 ? "bg-blue-900/20 border-blue-500/30" : "bg-orange-900/20 border-orange-500/30"} />
                  </>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-black text-slate-100">At a Glance</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {!dashboardData.stats ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-lg border border-zinc-700 bg-zinc-800"></div>)
                ) : (
                  <>
                    <StatCard title="Pending Tasks" value={dashboardData.stats.pendingTasks} icon={<ListTodo />} bgColor="bg-purple-900/20 border-purple-500/30" />
                    <StatCard title="Tasks Done (Week)" value={dashboardData.stats.tasksCompletedThisWeek} icon={<CheckCircle />} bgColor="bg-green-900/20 border-green-500/30" />
                    <StatCard title="Total Notes" value={dashboardData.stats.totalNotes} icon={<StickyNote />} bgColor="bg-orange-900/20 border-orange-500/30" />
                    <StatCard title="Total Blog Views" value={dashboardData.stats.totalBlogViews} icon={<Eye />} bgColor="bg-yellow-900/20 border-yellow-500/30" />
                  </>
                )}
              </div>
            </div>

            {dashboardData.pinnedNotes.length > 0 && (
              <div>
                <h3 className="mb-3 text-xl font-bold text-slate-100">Pinned Notes</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {dashboardData.pinnedNotes.map(note => (
                    <div key={note.id} className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4">
                      <h4 className="truncate font-bold text-slate-100">{note.title || "Untitled Note"}</h4>
                      <p className="mt-1 line-clamp-3 text-xs text-zinc-400">{note.content}</p>
                      <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => setActiveTab('notes')}>
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dashboardData.recentPosts.length > 0 && (
              <div>
                <h3 className="mb-3 text-xl font-bold text-slate-100">Recently Updated Blog Posts</h3>
                <div className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
                  {dashboardData.recentPosts.map(post => (
                    <div key={post.id} className="flex flex-col items-start gap-2 rounded-md border border-zinc-700 bg-zinc-900/50 p-3 hover:bg-zinc-700/50 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <button
                          onClick={() => setActiveTab('blogs')}
                          className="text-left font-semibold text-slate-100 hover:text-accent hover:underline"
                        >
                          {post.title}
                        </button>
                        <p className="text-xs text-zinc-400">
                          Updated: {new Date(post.updated_at || "").toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex w-full shrink-0 space-x-2 sm:w-auto">
                        <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
                          <Button asChild variant="ghost" size="sm" className="flex-1 px-2 py-1 text-xs">
                            <a target="_blank" rel="noopener noreferrer" aria-label={`View post: ${post.title}`}>
                              <ExternalLink className="mr-1 size-3.5" /> View
                            </a>
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 px-2 py-1 text-xs"
                          onClick={() => setActiveTab('blogs')}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {activeTab !== "dashboard" && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 sm:p-6"
          >
            {activeTab === "blogs" && <BlogManager />}
            {activeTab === "content" && <ContentManager />}
            {activeTab === "tasks" && <TaskManager />}
            {activeTab === "notes" && <NotesManager />}
            {activeTab === "finance" && <FinanceManager />}
            {activeTab === "security" && <SecuritySettings />}
          </motion.div>
        )}
      </div>
    </div>
  );
}