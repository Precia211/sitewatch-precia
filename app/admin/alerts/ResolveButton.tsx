"use client";

import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function ResolveButton({
  alertId,
}: {
  alertId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  async function resolveAlert() {
    const { error } = await supabase
      .from("alerts")
      .update({
        resolved: true,
      })
      .eq("id", alertId);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={resolveAlert}
      className="rounded bg-green-600 px-4 py-2 text-white"
    >
      Resolve
    </button>
  );
}