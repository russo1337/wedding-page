import { NextResponse } from "next/server";
import { eventOptions } from "@/lib/data";
import { getSheetsClient } from "@/lib/googleSheets";

const registrations = [];

async function appendRegistration(record) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable.");
  }

  const sheets = await getSheetsClient();
  const worksheet = process.env.GOOGLE_SHEETS_RESERVATION_WORKSHEET_NAME || "Registrations";
  const range = `${worksheet}!A:G`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        record.createdAt,
        record.fullName,
        record.email,
        record.partySize,
        record.attending.join(", "),
        record.message,
        record.id
      ]]
    }
  });
}

export async function GET() {
  return NextResponse.json({ registrations });
}

export async function POST(request) {
  const payload = await request.json();
  const { fullName, email, partySize, attending, message } = payload;

  const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const size = Number(partySize) || 1;
  const attendingIds = Array.isArray(attending) ? attending : [];

  const validEventIds = new Set(eventOptions.map((option) => option.id));
  const invalidSelection = attendingIds.some((id) => !validEventIds.has(id));

  if (!trimmedName || !trimmedEmail || invalidSelection || attendingIds.length === 0) {
    return NextResponse.json(
      { message: "Bitte gebt euren Namen, eure E-Mail-Adresse und mindestens einen Programmpunkt an." },
      { status: 400 }
    );
  }

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fullName: trimmedName,
    email: trimmedEmail,
    partySize: Math.max(1, Math.min(size, 12)),
    attending: attendingIds,
    message: typeof message === "string" ? message.trim() : "",
    createdAt: new Date().toISOString()
  };

  try {
    await appendRegistration(record);
    registrations.push(record);
  } catch (error) {
    console.error("Failed to append registration to Google Sheets", error);
    return NextResponse.json(
      { message: "Wir konnten eure Anmeldung nicht speichern. Bitte versucht es spaeter erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Danke! Eure Anmeldung ist eingegangen. Wir melden uns bald mit weiteren Details.",
      registrationId: record.id
    },
    { status: 201 }
  );
}
