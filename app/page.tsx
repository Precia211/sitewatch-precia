
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "viewer";

  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: alerts, error: alertsError } = await supabase
    .from("alerts")
    .select("id, triggered_at, resolved, site_id")
    .eq("resolved", false)
    .order("triggered_at", { ascending: false });

  const siteList = sites ?? [];
  const alertList = alerts ?? [];
  const totalSites = siteList.length;
  const onlineSites = siteList.filter(
    (site) => site.status === "online"
  ).length;

  const latestAlert = alertList[0];
  const latestAlertSite = latestAlert
    ? siteList.find((site) => site.id === latestAlert.site_id)
    : null;

  const lastCheck = latestAlert?.triggered_at
    ? new Date(latestAlert.triggered_at).toLocaleString()
    : "No recent alerts";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 shadow-sm md:px-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Site <span className="text-blue-600">Watch</span>
          </h1>
          <p className="text-sm text-slate-500">
            Remote Site Monitoring Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="text-slate-500">Logged in as</p>
            <p className="font-semibold capitalize">{role}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] md:grid-cols-[235px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-4 md:min-h-[calc(100vh-81px)] md:border-b-0 md:border-r">
          <nav className="space-y-2">
            <a href="/" className="block rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-700">
              ◈ Dashboard
            </a>
            <a href="/admin/sites" className="block rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-700">
              ⌖ Manage Sites
            </a>
            <a href="/admin/alerts" className="block rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-700">
              ♧ Manage Alerts
            </a>
            {role === "admin" && (
              <a href="/admin/rules" className="block rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-700">
                ◈ Manage Alert Rules
              </a>
            )}
          </nav>

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Site Watch</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Monitor remote sites, check site status, and manage alerts.
            </p>
          </div>
        </aside>

        <div className="min-w-0 p-4 md:p-8">
          <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 p-6 shadow-sm">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Monitoring overview
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Welcome back, {role}!
              </h2>
              <p className="mt-2 text-slate-500">
                Here&apos;s the current status of your remote sites.
              </p>
            </div>
            <div className="rounded-xl border border-green-200 bg-white px-4 py-3 shadow-sm">
              <p className="font-semibold text-green-700">● Dashboard Online</p>
              <p className="mt-1 text-xs text-slate-500">
                Site status from your database
              </p>
            </div>
          </section>

          {sitesError && (
            <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
              Error loading sites: {sitesError.message}
            </p>
          )}

          {alertsError && (
            <p className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
              Error loading alerts: {alertsError.message}
            </p>
          )}

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Sites" value={totalSites} detail="Registered remote sites" accent="blue" icon="⌖" />
            <StatCard title="Online Sites" value={onlineSites} detail="Sites currently online" accent="green" icon="⌁" />
            <StatCard title="Active Alerts" value={alertList.length} detail="Require attention" accent="red" icon="⚠" />
            <StatCard title="Latest Alert" value={latestAlert ? new Date(latestAlert.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"} detail={latestAlert ? new Date(latestAlert.triggered_at).toLocaleDateString() : "No recent alerts"} accent="purple" icon="◷" />
          </section>

          {role === "admin" && (
            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-lg font-bold">Admin Controls</h2>
              <p className="mb-4 text-sm text-slate-500">
                Manage monitoring sites, alerts, and alert rules.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/admin/sites" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Manage Sites →
                </a>
                <a href="/admin/alerts" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage Alerts →
                </a>
                <a href="/admin/rules" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Manage Alert Rules →
                </a>
              </div>
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sites</h2>
                  <p className="text-sm text-slate-500">Monitor your remote locations</p>
                </div>
                <a href="/admin/sites" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  View all sites →
                </a>
              </div>

              {siteList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Site name</th>
                        <th className="px-5 py-3">Location</th>
                        <th className="px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {siteList.map((site) => (
                        <tr key={site.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4 font-semibold text-slate-800">{site.name}</td>
                          <td className="px-5 py-4 text-slate-500">{site.location}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              site.status === "online"
                                ? "bg-green-50 text-green-700"
                                : site.status === "maintenance"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              <span>●</span>{site.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="p-6 text-sm text-slate-500">No sites found.</p>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active Alerts</h2>
                  <p className="text-sm text-slate-500">Review alerts that need attention</p>
                </div>
                <a href="/admin/alerts" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  View all →
                </a>
              </div>

              <div className="space-y-3 p-4">
                {alertList.length > 0 ? (
                  alertList.map((alert) => {
                    const alertSite = siteList.find((site) => site.id === alert.site_id);
                    return (
                      <article key={alert.id} className="rounded-xl border border-red-100 border-l-4 border-l-red-500 bg-red-50/60 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h3 className="font-bold text-red-800">Active Alert</h3>
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Active</span>
                        </div>
                        <dl className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <dt className="w-20 shrink-0 text-slate-500">Site:</dt>
                            <dd className="font-semibold text-slate-800">{alertSite?.name ?? "Unknown site"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 shrink-0 text-slate-500">Location:</dt>
                            <dd className="text-slate-700">{alertSite?.location ?? "Unknown location"}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 shrink-0 text-slate-500">Triggered:</dt>
                            <dd className="text-slate-700">{new Date(alert.triggered_at).toLocaleString()}</dd>
                          </div>
                          <div className="flex gap-2">
                            <dt className="w-20 shrink-0 text-slate-500">Resolved:</dt>
                            <dd className="text-slate-700">No</dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl bg-green-50 p-6 text-center">
                    <p className="font-semibold text-green-700">No active alerts</p>
                    <p className="mt-1 text-sm text-slate-500">All clear for now.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-bold text-slate-900">System Status</h2>
              <p className="text-sm text-slate-500">
                Overview of the data available to the dashboard
              </p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <HealthItem title="Database data" detail={sitesError || alertsError ? "Check connection" : "Loaded"} healthy={!sitesError && !alertsError} />
              <HealthItem title="Site records" detail={`${totalSites} registered`} healthy={!sitesError} />
              <HealthItem title="Alert records" detail={`${alertList.length} active`} healthy={!alertsError} />
            </div>
          </section>

          <footer className="flex flex-wrap justify-between gap-2 py-6 text-xs text-slate-400">
            <span>Site Watch · Remote Site Monitoring</span>
            <span>Secure · Monitor · Protect</span>
          </footer>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  detail,
  accent,
  icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  accent: "blue" | "green" | "red" | "purple";
  icon: string;
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold ${styles[accent]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400">SITE WATCH</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 break-words text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function HealthItem({
  title,
  detail,
  healthy,
}: {
  title: string;
  detail: string;
  healthy: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <span className={`h-3 w-3 shrink-0 rounded-full ${healthy ? "bg-green-500" : "bg-red-500"}`} />
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}