const STORAGE_KEY = "wishlist-basket";

export function loadBasket() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const giftId = typeof item.giftId === "string" ? item.giftId : "";
        const parts = Number.isFinite(item.parts) ? Math.max(1, Math.floor(item.parts)) : 1;

        if (!giftId) {
          return null;
        }

        return { giftId, parts };
      })
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to parse wishlist basket from storage", error);
    return [];
  }
}

export function saveBasket(items) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload = Array.isArray(items) ? items : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to persist wishlist basket", error);
  }
}

export function clearBasket() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear wishlist basket", error);
  }
}

export function parseNumericPrice(price) {
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

export function extractCurrencyParts(price) {
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

export function calculateContributionDetails(price, totalParts, selectedParts) {
  const total = parseNumericPrice(price);
  if (!Number.isFinite(total) || total <= 0) {
    return { label: "", numeric: 0, prefix: "", suffix: "" };
  }

  const parts = Math.max(1, selectedParts || 1);
  const base = totalParts && totalParts > 0 ? total / totalParts : total;
  const numeric = Math.round(base * parts * 100) / 100;
  const formattedValue = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
  const { prefix, suffix } = extractCurrencyParts(price);
  const label = prefix
    ? `${prefix} ${formattedValue}`.trim()
    : suffix
      ? `${formattedValue} ${suffix}`.trim()
      : formattedValue;

  return { label, numeric, prefix, suffix };
}

export function formatPricePerPart(price, parts) {
  if (!price || parts <= 1) {
    return "";
  }

  const details = calculateContributionDetails(price, parts, 1);
  return details.label ? `${details.label} pro Anteil` : "";
}

export function formatContributionTotal(price, totalParts, selectedParts) {
  return calculateContributionDetails(price, totalParts, selectedParts).label;
}
