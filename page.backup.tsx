import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function Home() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "viewer";

  // Get sites
  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  // Get active alerts
  const { data: alerts, error: alertsError } = await supabase
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
    .eq("resolved", false)
    .order("triggered_at", { ascending: false });

  const totalSites = sites?.length ?? 0;

  const onlineSites =
    sites?.filter((site) => site.status === "online").length ?? 0;

  const activeAlerts = alerts?.length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold">Site Watch</h1>
          <p className="text-gray-600">
            Remote Site Monitoring Dashboard
          </p>
        </div>

        <LogoutButton />
      </div>

      {/* User Role */}
      <p className="text-sm text-gray-500 mb-8">
        Logged in as: <strong>{role}</strong>
      </p>
   {/* Admin Controls */}
{role === "admin" && (
  <section className="mb-10 rounded-lg bg-white p-6 shadow">
    <h2 className="text-2xl font-semibold mb-2">
      Admin Controls
    </h2>

    <p className="text-gray-600 mb-4">
      You have administrator access.
    </p>

    <div className="flex gap-4 flex-wrap">
      <a
        href="/admin/sites"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Manage Sites
      </a>

      <a
        href="/admin/alerts"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Manage Alerts
      </a>

      <a
        href="/admin/rules"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Manage Alert Rules
      </a>
    </div>
  </section>
)}

      {/* Status Summary */}
      <section className="grid gap-4 md:grid-cols-3 mb-10">

        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Total Sites</p>
          <p className="text-3xl font-bold mt-2">
            {totalSites}
          </p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Online Sites</p>
          <p className="text-3xl font-bold mt-2">
            {onlineSites}
          </p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow">
          <p className="text-gray-500">Active Alerts</p>
          <p className="text-3xl font-bold mt-2">
            {activeAlerts}
          </p>
        </div>

      </section>

      {/* Sites */}
      <section className="mb-10">

        <h2 className="text-2xl font-semibold mb-4">
          Sites
        </h2>

        {sitesError && (
          <p className="text-red-600 mb-4">
            Error loading sites: {sitesError.message}
          </p>
        )}

        {sites && sites.length > 0 ? (
          <div className="grid gap-4">

            {sites.map((site) => (
              <div
                key={site.id}
                className="rounded-lg bg-white p-5 shadow"
              >
                <h3 className="text-xl font-semibold">
                  {site.name}
                </h3>

                <p className="text-gray-600">
                  {site.location}
                </p>

                <p className="mt-2">
                  Status: <strong>{site.status}</strong>
                </p>
              </div>
            ))}

          </div>
        ) : (
          <p>No sites found.</p>
        )}

      </section>

      {/* Alerts */}
      <section>

        <h2 className="text-2xl font-semibold mb-4">
          Alerts
        </h2>

        {alertsError && (
          <p className="text-red-600 mb-4">
            Error loading alerts: {alertsError.message}
          </p>
        )}

        {alerts && alerts.length > 0 ? (
          <div className="grid gap-4">

            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg bg-white p-5 shadow border-l-4 border-red-500"
              >

                <h3 className="text-xl font-semibold text-red-600">
                  Active Alert
                </h3>

                <p className="mt-2">
                  Site: <strong>{alert.sites?.[0]?.name}</strong>
                </p>

                <p>
                  Location: {alert.sites?.[0]?.location}
                </p>

                <p className="mt-2 text-gray-600">
                  Triggered:{" "}
                  {new Date(alert.triggered_at).toLocaleString()}
                </p>

                <p className="mt-1">
                  Resolved: <strong>No</strong>
                </p>

              </div>
            ))}

          </div>
        ) : (
          <p>No active alerts.</p>
        )}

      </section>

    </main>
  );
}