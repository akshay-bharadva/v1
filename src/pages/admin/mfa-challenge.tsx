/*
This file is updated for the new design system.
- The `font-space` class is removed, as `font-sans` is now the global default.
- The `Layout` component is used to wrap the page content, ensuring a consistent shell across the application.
- All styling is now handled within the `SupabaseMFAChallenge` component, which has already been redesigned.
*/
import SupabaseMFAChallenge from "@/components/admin/auth/SupabaseMFAChallenge";
import Layout from "@/components/layout";

export default function AdminMFAChallengePage() {
  return (
    <Layout>
      <div>
        <SupabaseMFAChallenge />
      </div>
    </Layout>
  );
}