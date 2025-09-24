"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  calculateContributionDetails,
  clearBasket,
  formatPricePerPart,
  loadBasket,
  saveBasket
} from "@/lib/wishlist-utils";

const EMPTY_CONTRIBUTOR = { name: "", email: "", message: "" };

export default function WishlistBasketPage() {
  const [gifts, setGifts] = useState([]);
  const [basket, setBasket] = useState([]);
  const [contributor, setContributor] = useState(EMPTY_CONTRIBUTOR);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Die Wunschliste kann gerade nicht geladen werden.");
      }

      const data = await response.json();
      const nextGifts = data?.gifts ?? [];
      let itemsRemoved = false;

      setGifts(nextGifts);
      setBasket((current) => {
        const adjusted = [];
        current.forEach((item) => {
          const gift = nextGifts.find((entry) => entry.id === item.giftId);
          if (!gift || gift.remainingParts <= 0) {
            itemsRemoved = true;
            return;
          }

          const maxParts = Math.max(1, gift.remainingParts);
          adjusted.push({
            giftId: item.giftId,
            parts: Math.min(Math.max(1, item.parts), maxParts)
          });
        });

        if (hasLoadedOnceRef.current && (adjusted.length !== current.length || itemsRemoved)) {
          saveBasket(adjusted);
        }

        return adjusted;
      });

      if (itemsRemoved) {
        setFeedback({
          type: "error",
          message: "Einige Geschenke sind nicht mehr verfügbar und wurden aus dem Korb entfernt."
        });
      }
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = loadBasket();
    setBasket(stored);
    fetchGifts();
  }, []);

  useEffect(() => {
    if (!hasLoadedOnceRef.current) {
      hasLoadedOnceRef.current = true;
      return;
    }
    saveBasket(basket);
  }, [basket]);

  const basketItems = useMemo(() => {
    return basket
      .map((item) => {
        const gift = gifts.find((entry) => entry.id === item.giftId);
        if (!gift) {
          return null;
        }

        const parts = Math.max(1, Math.min(gift.remainingParts || 1, item.parts || 1));
        const amountDetails = calculateContributionDetails(gift.price, gift.totalParts, parts);

        return {
          giftId: item.giftId,
          giftTitle: gift.title,
          parts,
          remainingParts: gift.remainingParts,
          totalParts: gift.totalParts,
          description: gift.description,
          imageUrl: gift.imageUrl,
          price: gift.price,
          pricePerPart: gift.totalParts > 1 ? formatPricePerPart(gift.price, gift.totalParts) : "",
          amountDetails
        };
      })
      .filter(Boolean);
  }, [basket, gifts]);

  const basketSummary = useMemo(() => {
    if (basketItems.length === 0) {
      return { totalLabel: "" };
    }

    let totalNumeric = 0;
    let prefix = null;
    let suffix = null;

    basketItems.forEach((item) => {
      totalNumeric += item.amountDetails.numeric;
      prefix = prefix === null ? item.amountDetails.prefix : prefix === item.amountDetails.prefix ? prefix : "";
      suffix = suffix === null ? item.amountDetails.suffix : suffix === item.amountDetails.suffix ? suffix : "";
    });

    if (totalNumeric <= 0) {
      return { totalLabel: "" };
    }

    const formattedValue = Number.isInteger(totalNumeric) ? String(totalNumeric) : totalNumeric.toFixed(2);
    if (prefix) {
      return { totalLabel: `${prefix} ${formattedValue}`.trim() };
    }
    if (suffix) {
      return { totalLabel: `${formattedValue} ${suffix}`.trim() };
    }
    return { totalLabel: formattedValue };
  }, [basketItems]);

  const handleContributorChange = (field, value) => {
    setContributor((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateBasketParts = (giftId, rawValue) => {
    const gift = gifts.find((entry) => entry.id === giftId);
    const maxParts = gift ? Math.max(1, gift.remainingParts) : 1;
    const parsed = Number(rawValue);
    const nextParts = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), maxParts) : 1;

    setBasket((current) =>
      current.map((item) => (item.giftId === giftId ? { ...item, parts: nextParts } : item))
    );
  };

  const removeFromBasket = (giftId) => {
    setBasket((current) => current.filter((item) => item.giftId !== giftId));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (basketItems.length === 0) {
      setFeedback({ type: "error", message: "Euer Korb ist leer." });
      return;
    }

    const trimmedName = contributor.name.trim();
    const trimmedEmail = contributor.email.trim();

    if (!trimmedName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFeedback({ type: "error", message: "Bitte gebt Name und eine gueltige E-Mail-Adresse an." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: contributor.message.trim(),
          items: basketItems.map((item) => ({
            giftId: item.giftId,
            parts: item.parts
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Wir konnten die Reservierung nicht speichern.");
      }

      setBasket([]);
      clearBasket();
      setContributor(EMPTY_CONTRIBUTOR);
      setFeedback({ type: "success", message: data?.message || "Vielen Dank für eure Reservierung!" });
      fetchGifts();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && gifts.length === 0) {
    return <p>Wunschliste wird geladen...</p>;
  }

  const canSubmit = basketItems.length > 0 && contributor.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contributor.email.trim());

  return (
    <section style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/wishlist" className="secondary-button">Zurück zur Wunschliste</Link>
        <h1 style={{ margin: 0 }}>Euer Korb</h1>
      </div>

      {feedback && (
        <div className={`feedback${feedback.type === "error" ? " error" : ""}`}>
          {feedback.message}
        </div>
      )}

      {basketItems.length === 0 ? (
        <p>Euer Korb ist leer. Geht zur <Link href="/wishlist">Wunschliste</Link> und fügt Geschenke hinzu.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "1rem" }}>
            {basketItems.map((item) => (
              <li key={item.giftId} className="card" style={{ display: "grid", gap: "0.55rem", padding: "0.85rem 1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                  <strong>{item.giftTitle}</strong>
                  <button type="button" className="secondary-button" onClick={() => removeFromBasket(item.giftId)}>
                    Entfernen
                  </button>
                </div>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.giftTitle}
                    style={{ borderRadius: "0.6rem", objectFit: "cover", maxHeight: "10rem" }}
                  />
                ) : null}
                <p style={{ fontSize: "0.95rem", margin: 0 }}>{item.description}</p>
                <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
                  <label style={{ display: "grid", gap: "0.4rem" }}>
                    Anteile
                    <input
                      type="number"
                      min={1}
                      max={item.remainingParts}
                      value={item.parts}
                      onChange={(event) => updateBasketParts(item.giftId, event.target.value)}
                    />
                  </label>
                  <div style={{ display: "grid", gap: "0.25rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "rgba(18, 58, 50, 0.75)" }}>
                      Verfügbar: {item.remainingParts} Anteil(e)
                    </span>
                    {item.price ? <span style={{ fontWeight: 600 }}>{item.price}</span> : null}
                    {item.pricePerPart ? (
                      <span style={{ fontSize: "0.9rem", color: "rgba(18, 58, 50, 0.75)" }}>
                        {item.pricePerPart}
                      </span>
                    ) : null}
                    {item.amountDetails.label ? (
                      <span style={{ fontWeight: 600 }}>Euer Beitrag: {item.amountDetails.label}</span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label>
                Euer Name
                <input
                  type="text"
                  value={contributor.name}
                  onChange={(event) => handleContributorChange("name", event.target.value)}
                  placeholder="Vor- und Nachname"
                  required
                />
              </label>
              <label>
                E-Mail-Adresse
                <input
                  type="email"
                  value={contributor.email}
                  onChange={(event) => handleContributorChange("email", event.target.value)}
                  placeholder="ihr@example.com"
                  required
                />
              </label>
            </div>

            <label>
              Nachricht (optional)
              <textarea
                rows={4}
                value={contributor.message}
                onChange={(event) => handleContributorChange("message", event.target.value)}
                placeholder="Ein paar Worte für uns"
              />
            </label>

            {basketSummary.totalLabel ? (
              <div className="feedback" style={{ background: "rgba(31, 187, 164, 0.12)", borderColor: "rgba(31, 187, 164, 0.35)", color: "#0f594a" }}>
                Gesamtsumme eurer Auswahl: <strong>{basketSummary.totalLabel}</strong>
              </div>
            ) : null}

            <button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Reservierung wird gesendet..." : "Reservierung abschicken"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}


