import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import SiteForm from "./SiteForm";


export default async function ManageSites() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data: sites } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Manage Sites
        </h1>

        <p className="text-gray-600 mb-8">
          Add, edit, or delete monitoring sites.
        </p>

        <SiteForm />



        <a
          href="/"
          className="inline-block mt-6 rounded bg-gray-700 px-4 py-2 text-white"
        >
          Back to Dashboard
        </a>

      </div>
    </main>
  );
}