"use client";

import { useEffect, useState } from "react";

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
    setPledges((current) => ({
      ...current,
      [giftId]: {
        ...(current[giftId] ?? {}),
        [field]: value
      }
    }));
  };

  const reserveGift = async (giftId) => {
    setFeedback(null);
    setActiveGift(giftId);

    try {
      const reservation = pledges[giftId] ?? {};
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId,
          name: reservation.name,
          message: reservation.message
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Wir konnten dieses Geschenk nicht reservieren.");
      }

      setFeedback({ type: "success", message: data?.message || "Geschenk reserviert." });
      // refresh list to reflect reservation state
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

  if (!loading && gifts.length === 0) {
    return <p>Die Wunschliste ist momentan leer. Schaut bald wieder vorbei!</p>;
  }

  return (
    <>
      {feedback && (
        <div className={`feedback${feedback.type === "error" ? " error" : ""}`}>
          {feedback.message}
        </div>
      )}
      <div className="card-grid">
        {gifts.map((gift) => {
          const isReserved = Boolean(gift.reservedBy);
          const pledge = pledges[gift.id] ?? { name: "", message: "" };

          return (
            <article key={gift.id} className="card">
              <div>
                <span className="tag">{gift.cost}</span>
              </div>
              <h3>{gift.title}</h3>
              <p>{gift.description}</p>

              {isReserved ? (
                <p style={{ fontStyle: "italic", color: "rgba(47, 26, 26, 0.7)" }}>
                  Reserviert von {gift.reservedBy}
                  {gift.note ? ` - "${gift.note}"` : ""}
                </p>
              ) : (
                <>
                  <label>
                    Euer Name (optional)
                    <input
                      type="text"
                      value={pledge.name}
                      onChange={(event) => updatePledge(gift.id, "name", event.target.value)}
                      placeholder="Wie dürfen wir uns bedanken?"
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
                  <button
                    type="button"
                    onClick={() => reserveGift(gift.id)}
                    disabled={activeGift === gift.id}
                  >
                    {activeGift === gift.id ? "Reservierung läuft..." : "Geschenk reservieren"}
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
