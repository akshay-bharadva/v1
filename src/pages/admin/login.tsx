/*
This file is updated for the new design system.
- The `font-space` class is removed from the container div, as the font is now handled globally.
- The `Layout` component wraps the login page to provide a consistent page shell, even for auth pages.
*/
import SupabaseLogin from "@/components/admin/auth/SupabaseLogin";
import Layout from "@/components/layout";

export default function AdminLoginPage() {
  return (
    <Layout>
      <div>
        <SupabaseLogin />
      </div>
    </Layout>
  );
}