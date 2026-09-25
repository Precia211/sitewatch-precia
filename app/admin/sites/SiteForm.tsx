"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

type Site = {
  id: string;
  name: string;
  location: string;
  status: string;
};

export default function SiteForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("online");

  const [sites, setSites] = useState<Site[]>([]);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadSites() {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setSites(data ?? []);
    }
  }

  async function handleAddSite(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase
      .from("sites")
      .insert({
        name,
        location,
        status,
      });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Site added successfully.");

    setName("");
    setLocation("");
    setStatus("online");

    await loadSites();
    router.refresh();
  }

  function startEdit(site: Site) {
    setEditingId(site.id);
    setName(site.name);
    setLocation(site.location);
    setStatus(site.status);
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setLocation("");
    setStatus("online");
    setMessage("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!editingId) return;

    const { error } = await supabase
      .from("sites")
      .update({
        name,
        location,
        status,
      })
      .eq("id", editingId);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Site updated successfully.");

    cancelEdit();

    await loadSites();
    router.refresh();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this site?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Site deleted successfully.");

    await loadSites();
    router.refresh();
  }

  return (
    <div className="space-y-8">

      {/* Add / Edit Form */}

      <form
        onSubmit={editingId ? handleUpdate : handleAddSite}
        className="rounded-lg bg-white p-6 shadow space-y-5"
      >
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Site" : "Add Site"}
        </h2>

        <div>
          <label className="block mb-1 font-medium">
            Site Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Example: Pretoria Office"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Location
          </label>

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Example: Pretoria"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex gap-3">

          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white"
          >
            {editingId ? "Save Changes" : "Add Site"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded bg-gray-500 px-4 py-2 text-white"
            >
              Cancel
            </button>
          )}

        </div>

        {message && (
          <p className="text-sm font-medium">
            {message}
          </p>
        )}
      </form>

      {/* Existing Sites */}

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Existing Sites
        </h2>

        <button
          type="button"
          onClick={loadSites}
          className="mb-4 rounded bg-gray-700 px-4 py-2 text-white"
        >
          Load Sites
        </button>

        <div className="space-y-4">

          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-lg bg-white p-5 shadow"
            >
              <h3 className="text-xl font-semibold">
                {site.name}
              </h3>

              <p className="text-gray-600">
                Location: {site.location}
              </p>

              <p className="text-gray-600">
                Status: {site.status}
              </p>

              <div className="mt-4 flex gap-3">

                <button
                  type="button"
                  onClick={() => startEdit(site)}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(site.id)}
                  className="rounded bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}

          {sites.length === 0 && (
            <p className="text-gray-600">
              Click "Load Sites" to display your sites.
            </p>
          )}

        </div>
      </section>

    </div>
  );
}