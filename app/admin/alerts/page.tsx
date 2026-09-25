import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import ResolveButton from "./ResolveButton";

export default async function ManageAlerts() {
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

  const { data: alerts, error } = await supabase
    .from("alerts")
    .select(`
      id,
      triggered_at,
      resolved,
      site_id,
      sites (
        name,
        location
      )
    `)
    .order("triggered_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Manage Alerts
        </h1>

        <p className="text-gray-600 mb-8">
          View monitoring alerts.
        </p>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 mb-6">
            Error loading alerts: {error.message}
          </div>
        )}

        <div className="space-y-4">

          {alerts?.map((alert) => {
            const site = Array.isArray(alert.sites)
              ? alert.sites[0]
              : alert.sites;

            return (
              <div
                key={alert.id}
                className="rounded-lg bg-white p-6 shadow"
              >
                <h2 className="text-xl font-semibold">
                  {site?.name ?? "Unknown Site"}
                </h2>

                <p className="text-gray-600">
                  Location: {site?.location ?? "Unknown"}
                </p>

                <p className="text-gray-600">
                  Triggered:{" "}
                  {new Date(alert.triggered_at).toLocaleString()}
                </p>

               <p className="mt-2">
  Status:{" "}
  <strong>
    {alert.resolved ? "Resolved" : "Active"}
  </strong>
</p>

{!alert.resolved && (
  <div className="mt-4">
    <ResolveButton alertId={alert.id} />
  </div>
)}
              </div>
            );
          })}

          {alerts?.length === 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              No alerts found.
            </div>
          )}

        </div>

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