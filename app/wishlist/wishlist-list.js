"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatContributionTotal,
  formatPricePerPart,
  loadBasket,
  saveBasket
} from "@/lib/wishlist-utils";

const FALLBACK_CATEGORY = "Weitere Wuensche";

export default function WishlistList() {
  const [gifts, setGifts] = useState([]);
  const [draftSelections, setDraftSelections] = useState({});
  const [basket, setBasket] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
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

      setFeedback((current) => {
        if (itemsRemoved) {
          return {
            type: "error",
            message: "Einige Geschenke sind nicht mehr verfuegbar und wurden aus dem Korb entfernt."
          };
        }
        return current && current.type === "success" ? current : null;
      });
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

  const basketCount = basket.reduce((total, item) => total + (item.parts || 0), 0);

  const handleDraftChange = (giftId, rawValue) => {
    const gift = gifts.find((entry) => entry.id === giftId);
    const maxParts = gift ? Math.max(1, gift.remainingParts) : 1;
    const parsed = Number(rawValue);
    const nextParts = Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), maxParts) : 1;

    setDraftSelections((current) => ({
      ...current,
      [giftId]: { parts: nextParts }
    }));
  };

  const addToBasket = (giftId) => {
    const gift = gifts.find((entry) => entry.id === giftId);
    if (!gift) {
      setFeedback({ type: "error", message: "Geschenk wurde nicht gefunden." });
      return;
    }

    if (gift.remainingParts <= 0) {
      setFeedback({ type: "error", message: "Dieses Geschenk ist bereits vollstaendig reserviert." });
      return;
    }

    const draft = draftSelections[giftId];
    const parts = Math.max(1, Math.min(gift.remainingParts, draft?.parts || 1));

    setBasket((current) => {
      const existingIndex = current.findIndex((item) => item.giftId === giftId);
      if (existingIndex >= 0) {
        const next = current.slice();
        next[existingIndex] = { giftId, parts };
        return next;
      }
      return [...current, { giftId, parts }];
    });

    setDraftSelections((current) => ({
      ...current,
      [giftId]: { parts }
    }));

    setFeedback({ type: "success", message: `${gift.title} wurde dem Korb hinzugefuegt.` });
  };

  if (loading && gifts.length === 0) {
    return <p>Wunschliste wird geladen...</p>;
  }

  if (!loading && groupedGifts.length === 0) {
    return <p>Die Wunschliste ist momentan leer. Schaut bald wieder vorbei!</p>;
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Link href="/wishlist/basket" className="primary-button">
          {basketCount > 0 ? `Zum Korb (${basketCount})` : "Zum Korb"}
        </Link>
      </div>

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
              const draft = draftSelections[gift.id] || { parts: 1 };
              const partsDraft = Math.max(1, Math.min(gift.remainingParts || 1, draft.parts || 1));
              const priceLabel = gift.price ? gift.price : "";
              const pricePerPartLabel = gift.totalParts > 1 ? formatPricePerPart(gift.price, gift.totalParts) : "";
              const contributionTotal = formatContributionTotal(gift.price, gift.totalParts, partsDraft);
              const partsLabel = gift.totalParts > 1
                ? `${gift.remainingParts} von ${gift.totalParts} Anteil(en) verfuegbar`
                : isReserved
                  ? "Bereits reserviert"
                  : "Noch verfuegbar";
              const inBasket = basket.find((item) => item.giftId === gift.id);

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
                                color: "rgba(18, 58, 50, 0.75)"
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
                    <p style={{ fontStyle: "italic", color: "rgba(18, 58, 50, 0.6)" }}>
                      Dieses Geschenk wurde bereits vollstaendig reserviert.
                    </p>
                  ) : (
                    <>
                      <label>
                        Anzahl Anteile
                        <input
                          type="number"
                          min={1}
                          max={gift.remainingParts}
                          value={partsDraft}
                          onChange={(event) => handleDraftChange(gift.id, event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => addToBasket(gift.id)}
                        className="primary-button"
                      >
                        {contributionTotal
                          ? `Zum Korb hinzufuegen - ${contributionTotal}`
                          : "Zum Korb hinzufuegen"}
                      </button>
                      {inBasket ? (
                        <span style={{ fontSize: "0.9rem", color: "rgba(18, 58, 50, 0.7)" }}>
                          Bereits im Korb: {inBasket.parts} Anteil(e)
                        </span>
                      ) : null}
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

