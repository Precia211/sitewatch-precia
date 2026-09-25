"use client";

import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Alert = {
  id: string;
  triggered_at: string;
  resolved: boolean;
  site_id: string | null;
  sites:
    | {
        name: string;
        location: string;
      }
    | {
        name: string;
        location: string;
      }[]
    | null;
};

export default function AlertManager({
  alerts,
}: {
  alerts: Alert[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [message, setMessage] = useState("");

  async function resolveAlert(id: string) {
    setMessage("");

    const { error } = await supabase
      .from("alerts")
      .update({
        resolved: true,
      })
      .eq("id", id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Alert resolved successfully.");

    router.refresh();
  }

  return (
    <section className="space-y-4">

      <h2 className="text-2xl font-semibold">
        Alerts
      </h2>

      {message && (
        <p className="rounded bg-white p-4 shadow">
          {message}
        </p>
      )}

      {alerts.length === 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">
            No alerts found.
          </p>
        </div>
      )}

      {alerts.map((alert) => {
        const site = Array.isArray(alert.sites)
          ? alert.sites[0]
          : alert.sites;

        return (
          <div
            key={alert.id}
            className="rounded-lg bg-white p-6 shadow"
          >

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-xl font-semibold">
                  {site?.name ?? "Unknown Site"}
                </h3>

                <p className="text-gray-600">
                  Location: {site?.location ?? "Unknown"}
                </p>

                <p className="text-gray-600">
                  Triggered:{" "}
                  {new Date(
                    alert.triggered_at
                  ).toLocaleString()}
                </p>

                <p className="mt-2">
                  Status:{" "}
                  <span
                    className={
                      alert.resolved
                        ? "font-semibold text-green-600"
                        : "font-semibold text-red-600"
                    }
                  >
                    {alert.resolved
                      ? "Resolved"
                      : "Active"}
                  </span>
                </p>
              </div>

              {!alert.resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="rounded bg-green-600 px-4 py-2 text-white"
                >
                  Resolve
                </button>
              )}

            </div>

          </div>
        );
      })}

    </section>
  );
}