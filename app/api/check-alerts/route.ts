import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Check that the logged-in user is an admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: admin access required" },
      { status: 403 }
    );
  }

  const { data: rules, error: rulesError } = await supabase
    .from("rules")
    .select("*")
    .eq("enabled", true);

  if (rulesError) {
    return NextResponse.json(
      { error: rulesError.message },
      { status: 500 }
    );
  }

  const { data: sites, error: sitesError } = await supabase
    .from("sites")
    .select("id, name, battery");

  if (sitesError) {
    return NextResponse.json(
      { error: sitesError.message },
      { status: 500 }
    );
  }

  let created = 0;

  for (const site of sites ?? []) {
    for (const rule of rules ?? []) {
      let metricValue: number | null = null;

      if (rule.metric === "battery") {
        metricValue = Number(site.battery);
      }

      if (metricValue === null || !Number.isFinite(metricValue)) {
        continue;
      }

      const triggered =
        rule.direction === "below"
          ? metricValue < Number(rule.threshold)
          : metricValue > Number(rule.threshold);

      if (!triggered) {
        continue;
      }

      const { data: existingAlert } = await supabase
        .from("alerts")
        .select("id")
        .eq("site_id", site.id)
        .eq("rule_id", rule.id)
        .eq("resolved", false)
        .maybeSingle();

      if (existingAlert) {
        continue;
      }

      const { error: insertError } = await supabase
        .from("alerts")
        .insert({
          site_id: site.id,
          rule_id: rule.id,
          triggered_at: new Date().toISOString(),
          resolved: false,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      created++;
    }
  }

  return NextResponse.json({
    success: true,
    alertsCreated: created,
  });
}