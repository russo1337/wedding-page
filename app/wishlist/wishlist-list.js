"use client";

import { useEffect, useMemo, useState } from "react";

const EMPTY_PLEDGE = { name: "", email: "", message: "", parts: 1 };
const FALLBACK_CATEGORY = "Weitere Wünsche";

function parseNumericPrice(price) {
  if (!price) {
    return null;
  }

  const digitsOnly = price.toString().replace(/[^0-9.,'\-]/g, "").replace(/'/g, "");
  if (!digitsOnly) {
    return null;
  }

  const commaIndex = digitsOnly.lastIndexOf(",");
  const dotIndex = digitsOnly.lastIndexOf(".");
  let normalized = digitsOnly;

  if (commaIndex > -1 && dotIndex > -1) {
    if (commaIndex > dotIndex) {
      normalized = normalized.replace(/\./g, "").replace(/,/g, ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (commaIndex > -1) {
    normalized = normalized.replace(/,/g, ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function extractCurrencyParts(price) {
  const trimmed = price?.trim?.() ?? "";
  if (!trimmed) {
    return { prefix: "", suffix: "" };
  }

  const prefixMatch = trimmed.match(/^[^\d-]+/);
  const suffixMatch = trimmed.match(/[^\d.,\s]+$/);

  const prefix = prefixMatch ? prefixMatch[0].trim() : "";
  const suffix = suffixMatch && (!prefix || suffixMatch[0].trim() !== prefix) ? suffixMatch[0].trim() : "";

  return { prefix, suffix };
}

function formatPricePerPart(price, parts) {
  if (!price || parts <= 1) {
    return "";
  }

  const total = parseNumericPrice(price);
  if (!Number.isFinite(total) || total <= 0) {
    return "";
  }

  const perPart = total / parts;
  const rounded = Math.round(perPart * 100) / 100;
  const formattedValue = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  const { prefix, suffix } = extractCurrencyParts(price);

  const valueWithCurrency = prefix
    ? `${prefix} ${formattedValue}`.trim()
    : suffix
      ? `${formattedValue} ${suffix}`.trim()
      : formattedValue;

  return `${valueWithCurrency} pro Anteil`;
}

function formatContributionTotal(price, totalParts, selectedParts) {
  if (!price) {
    return "";
  }

  const total = parseNumericPrice(price);
  if (!Number.isFinite(total) || total <= 0) {
    return "";
  }

  const parts = Math.max(1, selectedParts || 1);
  const base = totalParts && totalParts > 0 ? total / totalParts : total;
  const amount = Math.round(base * parts * 100) / 100;
  const formattedValue = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const { prefix, suffix } = extractCurrencyParts(price);

  if (prefix) {
    return `${prefix} ${formattedValue}`.trim();
  }
  if (suffix) {
    return `${formattedValue} ${suffix}`.trim();
  }
  return formattedValue;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function WishlistList() {
  const [gifts, setGifts] = useState([]);
  const [pledges, setPledges] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeGift, setActiveGift] = useState(null);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Die Wunschliste kann gerade nicht geladen werden.");
      }
      const data = await response.json();
      setGifts(data?.gifts ?? []);
      setFeedback(null);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const updatePledge = (giftId, field, value) => {
    setPledges((current) => {
      const existing = current[giftId] ? { ...current[giftId] } : { ...EMPTY_PLEDGE };
      let nextValue = value;

      if (field === "parts") {
        const parsed = Number(value);
        nextValue = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
      }

      return {
        ...current,
        [giftId]: {
          ...existing,
          [field]: nextValue
        }
      };
    });
  };

  const groupedGifts = useMemo(() => {
    const groups = new Map();

    gifts.forEach((gift) => {
      const groupKey = gift.category?.trim() || FALLBACK_CATEGORY;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(gift);
    });

    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: items.slice().sort((a, b) => a.title.localeCompare(b.title, "de"))
      }))
      .sort((a, b) => a.category.localeCompare(b.category, "de"));
  }, [gifts]);

  const reserveGift = async (giftId) => {
    setFeedback(null);
    setActiveGift(giftId);

    try {
      const gift = gifts.find((entry) => entry.id === giftId);
      if (!gift) {
        throw new Error("Geschenk wurde nicht gefunden.");
      }

      const pledge = pledges[gift.id] ? { ...pledges[gift.id] } : { ...EMPTY_PLEDGE };
      const trimmedName = (pledge.name ?? "").trim();
      const trimmedEmail = (pledge.email ?? "").trim();

      if (!trimmedName || !trimmedEmail || !isValidEmail(trimmedEmail)) {
        setFeedback({ type: "error", message: "Bitte gebt Name und eine gültige E-Mail-Adresse an." });
        setActiveGift(null);
        return;
      }

      const requestedParts = Math.max(1, Math.min(gift.remainingParts || 1, Number(pledge.parts) || 1));

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId,
          name: trimmedName,
          email: trimmedEmail,
          message: pledge.message,
          parts: requestedParts
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Wir konnten dieses Geschenk nicht reservieren.");
      }

      setFeedback({ type: "success", message: data?.message || "Geschenk reserviert." });
      setPledges((current) => ({
        ...current,
        [gift.id]: { ...EMPTY_PLEDGE }
      }));
      await fetchGifts();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setActiveGift(null);
    }
  };

  if (loading && gifts.length === 0) {
    return <p>Wunschliste wird geladen...</p>;
  }

  if (!loading && groupedGifts.length === 0) {
    return <p>Die Wunschliste ist momentan leer. Schaut bald wieder vorbei!</p>;
  }

  return (
    <>
      {feedback && (
        <div className={`feedback${feedback.type === "error" ? " error" : ""}`}>
          {feedback.message}
        </div>
      )}

      {groupedGifts.map(({ category, items }) => (
        <section key={category} style={{ display: "grid", gap: "1.8rem" }}>
          <h2>{category}</h2>
          <div className="card-grid">
            {items.map((gift) => {
              const isReserved = gift.remainingParts === 0;
              const pledge = pledges[gift.id] ? { ...pledges[gift.id] } : { ...EMPTY_PLEDGE };
              const priceLabel = gift.price ? gift.price : "";
              const pricePerPartLabel = gift.totalParts > 1 ? formatPricePerPart(gift.price, gift.totalParts) : "";
              const selectedParts = Math.max(1, Math.min(gift.remainingParts || 1, Number(pledge.parts) || 1));
              const contributionTotal = formatContributionTotal(gift.price, gift.totalParts, selectedParts);
              const partsLabel = gift.totalParts > 1
                ? `${gift.remainingParts} von ${gift.totalParts} Anteil(en) verfügbar`
                : isReserved
                  ? "Bereits reserviert"
                  : "Noch verfügbar";

              return (
                <article key={gift.id} className="card" style={{ display: "grid", gap: "0.8rem" }}>
                  {gift.imageUrl ? (
                    <img
                      src={gift.imageUrl}
                      alt={gift.title}
                      style={{ width: "100%", borderRadius: "0.6rem", objectFit: "cover", maxHeight: "14rem" }}
                    />
                  ) : null}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <span className="tag">{partsLabel}</span>
                    <h3>{gift.title}</h3>
                    {priceLabel ? (
                      <strong>
                        {pricePerPartLabel ? (
                          <span
                            style={{
                              display: "inline-flex",
                              flexDirection: "column",
                              gap: "0.2rem",
                              fontWeight: 600,
                              lineHeight: 1.2
                            }}
                          >
                            <span>{priceLabel}</span>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "rgba(47, 26, 26, 0.75)"
                              }}
                            >
                              {pricePerPartLabel}
                            </span>
                          </span>
                        ) : priceLabel}
                      </strong>
                    ) : null}
                    <p>{gift.description}</p>
                    {gift.url ? (
                      <a href={gift.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.95rem" }}>
                        Mehr erfahren
                      </a>
                    ) : null}
                  </div>

                  {isReserved ? (
                    <p style={{ fontStyle: "italic", color: "rgba(47, 26, 26, 0.7)" }}>
                      Dieses Geschenk wurde bereits vollständig reserviert.
                    </p>
                  ) : (
                    <>
                      <label>
                        Euer Name (erforderlich)
                        <input
                          type="text"
                          value={pledge.name}
                          onChange={(event) => updatePledge(gift.id, "name", event.target.value)}
                          placeholder="Vor- und Nachname"
                          required
                        />
                      </label>
                      <label>
                        E-Mail-Adresse (erforderlich)
                        <input
                          type="email"
                          value={pledge.email}
                          onChange={(event) => updatePledge(gift.id, "email", event.target.value)}
                          placeholder="ihr@example.com"
                          required
                        />
                      </label>
                      <label>
                        Nachricht (optional)
                        <textarea
                          rows={3}
                          value={pledge.message}
                          onChange={(event) => updatePledge(gift.id, "message", event.target.value)}
                          placeholder="Hinterlasst uns eine Nachricht"
                        />
                      </label>
                      {gift.totalParts > 1 ? (
                        <label>
                          Anzahl Anteile
                          <input
                            type="number"
                            min={1}
                            max={gift.remainingParts}
                            value={pledge.parts}
                            onChange={(event) => updatePledge(gift.id, "parts", event.target.value)}
                          />
                        </label>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => reserveGift(gift.id)}
                        disabled={activeGift === gift.id}
                      >
                        {activeGift === gift.id
                          ? "Reservierung läuft..."
                          : contributionTotal
                            ? `Geschenk reservieren - ${contributionTotal}`
                            : "Geschenk reservieren"}
                      </button>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
