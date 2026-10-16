"use client";

import { useState } from "react";

export default function CountForm({ initialCount = 0, initialRandom = 1 }) {
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [currentRandom, setCurrentRandom] = useState(initialRandom);
  const [newCount, setNewCount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCount) return;
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: Number(newCount) }),
      });

      if (res.ok) {
        setStatus("Count updated successfully!");
        setCurrentCount(Number(newCount));
        setCurrentRandom((prev) => (prev >= 5 ? 1 : prev + 1));
        setNewCount("");
      } else {
        setStatus("Failed to update count.");
      }
    } catch {
      setStatus("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="count-card">
      <h1 className="count-title">Count Submission</h1>

      <div className="stats-box">
        <div className="stat-item">
          <span className="stat-label">Current Count</span>
          <span className="stat-val">{currentCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Random Index</span>
          <span className="stat-val">{currentRandom}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="count-form">
        <label htmlFor="countInput" className="input-label">
          Set New Count:
        </label>
        <input
          id="countInput"
          type="number"
          value={newCount}
          onChange={(e) => setNewCount(e.target.value)}
          placeholder="Enter count number"
          required
          className="count-input"
        />

        <button type="submit" disabled={loading} className="count-submit-btn">
          {loading ? "Submitting..." : "Update Count"}
        </button>
      </form>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
}
