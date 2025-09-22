import { NextResponse } from "next/server";
import { getSheetsClient } from "@/lib/googleSheets";

const DEFAULT_WISHLIST_WORKSHEET = "Wishlist";

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
        rowNumber: rowOffset + 2 // account for header row
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
      range: `${logWorksheet}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          entry.timestamp,
          entry.giftId,
          entry.giftTitle,
          entry.parts,
          entry.name,
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
  const { giftId, name, message, parts } = payload;

  if (!giftId) {
    return NextResponse.json({ message: "Geschenk-ID fehlt." }, { status: 400 });
  }

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    return NextResponse.json({ message: "Bitte gebt euren Namen für diese Reservierung an." }, { status: 400 });
  }

  const trimmedMessage = typeof message === "string" ? message.trim() : "";
  const requestedParts = Math.max(1, Math.round(toNumber(parts) || 1));

  try {
    const { spreadsheetId, worksheetName, gifts, columnIndices } = await loadWishlistSheet();
    const target = gifts.find((gift) => gift.id === giftId);

    if (!target) {
      return NextResponse.json({ message: "Geschenk wurde nicht gefunden." }, { status: 404 });
    }

    if (target.remainingParts <= 0) {
      return NextResponse.json(
        { message: "Dieses Geschenk wurde bereits komplett reserviert." },
        { status: 409 }
      );
    }

    if (requestedParts > target.remainingParts) {
      return NextResponse.json(
        {
          message: `Es sind nur noch ${target.remainingParts} Anteil(e) verfügbar.`
        },
        { status: 409 }
      );
    }

    const sheets = await getSheetsClient();
    const newContributedParts = target.contributedParts + requestedParts;

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
      name: trimmedName,
      message: trimmedMessage
    });

    const remainingParts = Math.max(0, target.totalParts - newContributedParts);

    return NextResponse.json({
      message: "Vielen Dank für eure Reservierung!",
      gift: {
        ...target,
        contributedParts: newContributedParts,
        remainingParts
      }
    });
  } catch (error) {
    console.error("Failed to reserve wishlist item", error);
    return NextResponse.json(
      { message: "Wir konnten dieses Geschenk nicht reservieren." },
      { status: 500 }
    );
  }
}
