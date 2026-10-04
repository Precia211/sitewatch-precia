"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

async function requireAdmin() {
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

  return supabase;
}

export async function createRule(formData: FormData) {
  const supabase = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const metric = String(formData.get("metric") ?? "").trim();
  const threshold = Number(formData.get("threshold"));
  const direction = String(formData.get("direction") ?? "");
  const enabled = formData.get("enabled") === "on";

  if (
    !name ||
    !metric ||
    !Number.isFinite(threshold) ||
    !["above", "below"].includes(direction)
  ) {
    throw new Error("Invalid alert rule details.");
  }

  const { error } = await supabase.from("rules").insert({
    name,
    metric,
    threshold,
    direction,
    enabled,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/rules");
}

export async function updateRule(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const metric = String(formData.get("metric") ?? "").trim();
  const threshold = Number(formData.get("threshold"));
  const direction = String(formData.get("direction") ?? "");
  const enabled = formData.get("enabled") === "on";

  if (
    !id ||
    !name ||
    !metric ||
    !Number.isFinite(threshold) ||
    !["above", "below"].includes(direction)
  ) {
    throw new Error("Invalid alert rule details.");
  }

  const { error } = await supabase
    .from("rules")
    .update({
      name,
      metric,
      threshold,
      direction,
      enabled,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/rules");
}

export async function deleteRule(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Rule ID is missing.");
  }

  const { error } = await supabase
    .from("rules")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/rules");
}