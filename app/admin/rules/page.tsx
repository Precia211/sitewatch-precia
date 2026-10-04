import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import {
  createRule,
  updateRule,
  deleteRule,
} from "./actions";

export default async function ManageRules() {
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

  const { data: rules, error } = await supabase
    .from("rules")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Manage Alert Rules</h1>

        <p className="text-gray-600 mb-8">
          Create rules using a metric, threshold, and direction.
        </p>

        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Add Alert Rule
          </h2>

          <form action={createRule} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">
                Rule Name
              </label>

              <input
                name="name"
                type="text"
                placeholder="Low Battery"
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Metric
              </label>

              <input
                name="metric"
                type="text"
                placeholder="battery"
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Threshold
              </label>

              <input
                name="threshold"
                type="number"
                step="any"
                placeholder="20"
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                Direction
              </label>

              <select
                name="direction"
                defaultValue="below"
                className="w-full rounded border px-3 py-2"
              >
                <option value="below">Below</option>
                <option value="above">Above</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                name="enabled"
                type="checkbox"
                defaultChecked
              />
              Enabled
            </label>

            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Add Rule
            </button>
          </form>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Existing Alert Rules
          </h2>

          {error && (
            <p className="text-red-600 mb-4">
              Error loading rules: {error.message}
            </p>
          )}

          {!error && (!rules || rules.length === 0) && (
            <p className="text-gray-600">
              No alert rules found.
            </p>
          )}

          <div className="space-y-6">
            {rules?.map((rule) => (
              <div
                key={rule.id}
                className="border rounded-lg p-4"
              >
                <form action={updateRule} className="space-y-3">
                  <input
                    type="hidden"
                    name="id"
                    value={rule.id}
                  />

                  <div>
                    <label className="block font-medium mb-1">
                      Rule Name
                    </label>

                    <input
                      name="name"
                      type="text"
                      defaultValue={rule.name}
                      required
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Metric
                    </label>

                    <input
                      name="metric"
                      type="text"
                      defaultValue={rule.metric}
                      required
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Threshold
                    </label>

                    <input
                      name="threshold"
                      type="number"
                      step="any"
                      defaultValue={rule.threshold}
                      required
                      className="w-full rounded border px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Direction
                    </label>

                    <select
                      name="direction"
                      defaultValue={rule.direction}
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="below">Below</option>
                      <option value="above">Above</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      name="enabled"
                      type="checkbox"
                      defaultChecked={rule.enabled}
                    />
                    Enabled
                  </label>

                  <button
                    type="submit"
                    className="rounded bg-green-600 px-4 py-2 text-white"
                  >
                    Update Rule
                  </button>
                </form>

                <form action={deleteRule} className="mt-3">
                  <input
                    type="hidden"
                    name="id"
                    value={rule.id}
                  />

                  <button
                    type="submit"
                    className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                    Delete Rule
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>

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