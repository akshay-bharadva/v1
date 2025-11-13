import SupabaseMFAChallenge from "@/components/features/admin/auth/Supabasemfachallenge";
import Layout from "@/components/layout/Layout";

export default function AdminMFAChallengePage() {
  return (
    <Layout>
      <div className="">
        <SupabaseMFAChallenge />
      </div>
    </Layout>
  );
}