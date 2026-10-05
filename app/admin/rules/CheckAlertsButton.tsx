"use client";

import { useState } from "react";

export default function CheckAlertsButton() {
  const [message, setMessage] = useState("");

  async function checkAlerts() {
    setMessage("Checking...");

    const response = await fetch("/api/check-alerts", {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Failed to check alerts.");
      return;
    }

    setMessage(`Alerts created: ${data.alertsCreated}`);
  }

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={checkAlerts}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Check Alerts Now
      </button>

      {message && (
        <p className="mt-2 text-sm text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}