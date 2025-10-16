import SupabaseMFASetup from "@/components/admin/auth/SupabaseMFASetup";
import Layout from "@/components/layout";

export default function AdminMFASetupPage() {
  return (
    <Layout>
      <div className="font-sans">
        <SupabaseMFASetup />
      </div>
    </Layout>
  );
}