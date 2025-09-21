"use client";

import { useMemo, useState } from "react";

export default function RegisterForm({ eventOptions }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    partySize: 1,
    attending: [],
    message: ""
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkboxOptions = useMemo(() => eventOptions ?? [], [eventOptions]);

  const toggleAttendance = (id) => {
    setForm((current) => {
      const selected = new Set(current.attending);
      if (selected.has(id)) {
        selected.delete(id);
      } else {
        selected.add(id);
      }
      return { ...current, attending: Array.from(selected) };
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          partySize: Number(form.partySize)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Wir konnten eure Anmeldung noch nicht speichern.");
      }

      setFeedback({ type: "success", message: data?.message || "Anmeldung gespeichert." });
      setForm({ fullName: "", email: "", partySize: 1, attending: [], message: "" });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Vollständiger Name
        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Euer vollständiger Name"
          required
        />
      </label>

      <label>
        E-Mail-Adresse
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="ihr@example.com"
          required
        />
      </label>

      <label>
        Für wie viele Personen sagt ihr zu?
        <input
          type="number"
          name="partySize"
          min={1}
          max={12}
          value={form.partySize}
          onChange={handleChange}
        />
      </label>

      <fieldset>
        <legend>Bei welchen Programmpunkten seid ihr dabei?</legend>
        <div className="card-grid">
          {checkboxOptions.map((option) => {
            const checked = form.attending.includes(option.id);
            return (
              <label
                key={option.id}
                className="card"
                style={{
                  display: "grid",
                  gap: "0.6rem",
                  alignItems: "start",
                  cursor: "pointer"
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <input
                    type="checkbox"
                    name="attending"
                    value={option.id}
                    checked={checked}
                    onChange={() => toggleAttendance(option.id)}
                    style={{ width: "1.1rem", height: "1.1rem" }}
                  />
                  <strong>{option.label}</strong>
                </span>
                <span style={{ fontSize: "0.95rem", color: "rgba(47, 26, 26, 0.8)" }}>
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label>
        Gibt es etwas, das wir wissen sollten?
        <textarea
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="Allergien, Musikwünsche, Reisepläne"
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gesendet..." : "Anmeldung abschicken"}
        </button>
      </div>

      {feedback && (
        <div className={`feedback${feedback.type === "error" ? " error" : ""}`}>
          {feedback.message}
        </div>
      )}
    </form>
  );
}
