import { NextResponse } from "next/server";
import { getSheetsClient } from "@/lib/googleSheets";
import { renderContributionEmail } from "@/emails/contribution-template";

const DEFAULT_WISHLIST_WORKSHEET = "Wishlist";

async function sendContributionEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.EMAIL_FROM) {
    console.warn("Email credentials missing; skip sending email.");
    return;
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
}

function normaliseKey(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().replace(/,/g, ".");
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function columnIndex(header, key) {
  return header.findIndex((column) => column === key);
}

function columnLetterFromIndex(index) {
  let dividend = index + 1;
  let columnName = "";

  while (dividend > 0) {
    const modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value ?? "");
}

function parsePriceToNumber(price) {
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

function calculateContributionDetails(price, totalParts, selectedParts) {
  const total = parsePriceToNumber(price);
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

function formatTotalLabel(amount, prefix, suffix) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  const formattedValue = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  if (prefix) {
    return `${prefix} ${formattedValue}`.trim();
  }
  if (suffix) {
    return `${formattedValue} ${suffix}`.trim();
  }
  return formattedValue;
}

async function loadWishlistSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable.");
  }

  const worksheetName = process.env.GOOGLE_SHEETS_WISHLIST_WORKSHEET_NAME || DEFAULT_WISHLIST_WORKSHEET;
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${worksheetName}!A:Z`
  });

  const values = response.data.values ?? [];
  if (values.length === 0) {
    return {
      spreadsheetId,
      worksheetName,
      header: [],
      gifts: [],
      columnIndices: {}
    };
  }

  const [rawHeader, ...rows] = values;
  const header = rawHeader.map((value) => normaliseKey(value));

  const idIndex = columnIndex(header, "id");
  const categoryIndex = columnIndex(header, "category");
  const titleIndex = columnIndex(header, "title");
  const descriptionIndex = columnIndex(header, "description");
  const priceIndex = columnIndex(header, "price");
  const partsIndex = columnIndex(header, "parts");
  const payedIndex = columnIndex(header, "payed");
  const urlIndex = columnIndex(header, "url");
  const imageUrlIndex = columnIndex(header, "imageurl");

  const gifts = rows
    .map((row, rowOffset) => {
      const id = idIndex >= 0 ? (row[idIndex]?.trim?.() ?? "") : "";
      if (!id) {
        return null;
      }

      const category = categoryIndex >= 0 ? row[categoryIndex] ?? "" : "";
      const title = titleIndex >= 0 ? row[titleIndex] ?? "" : "";
      const description = descriptionIndex >= 0 ? row[descriptionIndex] ?? "" : "";
      const price = priceIndex >= 0 ? row[priceIndex] ?? "" : "";
      const partsRaw = partsIndex >= 0 ? row[partsIndex] ?? "" : "";
      const payedRaw = payedIndex >= 0 ? row[payedIndex] ?? "" : "";
      const url = urlIndex >= 0 ? row[urlIndex] ?? "" : "";
      const imageUrl = imageUrlIndex >= 0 ? row[imageUrlIndex] ?? "" : "";

      const totalParts = Math.max(1, Math.round(toNumber(partsRaw) || 1));
      const contributedParts = Math.max(0, Math.round(toNumber(payedRaw)));
      const remainingParts = Math.max(0, totalParts - contributedParts);

      return {
        id,
        category: category?.toString() ?? "",
        title: title?.toString() ?? "",
        description: description?.toString() ?? "",
        price: price?.toString() ?? "",
        totalParts,
        contributedParts,
        remainingParts,
        url: url?.toString() ?? "",
        imageUrl: imageUrl?.toString() ?? "",
        rowNumber: rowOffset + 2
      };
    })
    .filter(Boolean);

  return {
    spreadsheetId,
    worksheetName,
    header,
    gifts,
    columnIndices: {
      payed: payedIndex
    }
  };
}

async function appendWishlistLog(entry) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const logWorksheet = process.env.GOOGLE_SHEETS_WISHLIST_LOG_WORKSHEET_NAME;

  if (!spreadsheetId || !logWorksheet) {
    return;
  }

  try {
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${logWorksheet}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          entry.timestamp,
          entry.giftId,
          entry.giftTitle,
          entry.parts,
          entry.name,
          entry.email,
          entry.message
        ]]
      }
    });
  } catch (logError) {
    console.error("Failed to append wishlist log entry", logError);
  }
}

export async function GET() {
  try {
    const { gifts } = await loadWishlistSheet();
    return NextResponse.json({ gifts });
  } catch (error) {
    console.error("Failed to load wishlist from Google Sheets", error);
    return NextResponse.json(
      { message: "Die Wunschliste kann gerade nicht geladen werden." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const payload = await request.json();
  const contributorName = typeof payload?.name === "string" ? payload.name.trim() : "";
  const contributorEmail = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const contributorMessage = typeof payload?.message === "string" ? payload.message.trim() : "";
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];

  if (!contributorName || !isValidEmail(contributorEmail)) {
    return NextResponse.json(
      { message: "Bitte gebt euren Namen und eine guültige E-Mail-Adresse an." },
      { status: 400 }
    );
  }

  if (rawItems.length === 0) {
    return NextResponse.json(
      { message: "Bitte wählt mindestens ein Geschenk aus." },
      { status: 400 }
    );
  }

  const aggregated = new Map();
  for (const item of rawItems) {
    const giftId = typeof item?.giftId === "string" ? item.giftId.trim() : "";
    const requestedParts = Math.max(1, Math.round(toNumber(item?.parts) || 0));

    if (!giftId) {
      return NextResponse.json({ message: "Geschenk-ID fehlt." }, { status: 400 });
    }

    if (requestedParts <= 0) {
      return NextResponse.json({ message: "Es wurde kein gültiger Anteil angegeben." }, { status: 400 });
    }

    aggregated.set(giftId, (aggregated.get(giftId) || 0) + requestedParts);
  }

  if (aggregated.size === 0) {
    return NextResponse.json(
      { message: "Bitte wählt mindestens ein Geschenk aus." },
      { status: 400 }
    );
  }

  try {
    const { spreadsheetId, worksheetName, gifts, columnIndices } = await loadWishlistSheet();
    const sheets = await getSheetsClient();

    const validations = [];

    for (const [giftId, requestedParts] of aggregated.entries()) {
      const target = gifts.find((gift) => gift.id === giftId);

      if (!target) {
        return NextResponse.json({ message: "Ein ausgewähltes Geschenk wurde nicht gefunden." }, { status: 404 });
      }

      if (target.remainingParts <= 0) {
        return NextResponse.json(
          { message: `"${target.title}" ist bereits vollständig reserviert.` },
          { status: 409 }
        );
      }

      if (requestedParts > target.remainingParts) {
        return NextResponse.json(
          {
            message: `Für "${target.title}" sind nur noch ${target.remainingParts} Anteil(e) verfuegbar.`
          },
          { status: 409 }
        );
      }

      validations.push({ target, requestedParts });
    }

    const updatedGifts = [];
    const emailItems = [];
    let totalNumeric = 0;
    let totalPrefix = null;
    let totalSuffix = null;

    for (const { target, requestedParts } of validations) {
      const newContributedParts = target.contributedParts + requestedParts;
      const remainingParts = Math.max(0, target.totalParts - newContributedParts);

      if (columnIndices.payed >= 0) {
        const payedColumnLetter = columnLetterFromIndex(columnIndices.payed);
        const targetCell = `${worksheetName}!${payedColumnLetter}${target.rowNumber}`;

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: targetCell,
          valueInputOption: "RAW",
          requestBody: {
            values: [[newContributedParts]]
          }
        });
      }

      await appendWishlistLog({
        timestamp: new Date().toISOString(),
        giftId: target.id,
        giftTitle: target.title,
        parts: requestedParts,
        name: contributorName,
        email: contributorEmail,
        message: contributorMessage
      });

      updatedGifts.push({
        id: target.id,
        contributedParts: newContributedParts,
        remainingParts
      });

      const amountDetails = calculateContributionDetails(target.price, target.totalParts, requestedParts);
      emailItems.push({
        title: target.title,
        parts: requestedParts,
        amountLabel: amountDetails.label
      });

      totalNumeric += amountDetails.numeric;
      totalPrefix = totalPrefix === null ? amountDetails.prefix : totalPrefix === amountDetails.prefix ? totalPrefix : "";
      totalSuffix = totalSuffix === null ? amountDetails.suffix : totalSuffix === amountDetails.suffix ? totalSuffix : "";
    }

    const totalAmountLabel = formatTotalLabel(totalNumeric, totalPrefix, totalSuffix);

    try {
      const html = renderContributionEmail({
        recipientName: contributorName,
        recipientEmail: contributorEmail,
        items: emailItems,
        totalAmountLabel,
        message: contributorMessage
      });

      await sendContributionEmail({
        to: contributorEmail,
        subject: "Vielen Dank für euren Beitrag",
        html
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email", emailError);
    }

    return NextResponse.json({
      message: "Vielen Dank für eure Reservierung!",
      gifts: updatedGifts
    });
  } catch (error) {
    console.error("Failed to reserve wishlist items", error);
    return NextResponse.json(
      { message: "Wir konnten eure Reservierung nicht speichern." },
      { status: 500 }
    );
  }
}
