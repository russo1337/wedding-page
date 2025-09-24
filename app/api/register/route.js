import { NextResponse } from "next/server";
import { eventOptions } from "@/lib/data";
import { getSheetsClient } from "@/lib/googleSheets";
import { isRegistrationEnabled } from "@/lib/features";

const registrations = [];

async function appendRegistration(record) {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable.");
  }

  const sheets = await getSheetsClient();
  const worksheet = process.env.GOOGLE_SHEETS_RESERVATION_WORKSHEET_NAME || "Registrations";
  const range = `${worksheet}!A:H`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        record.createdAt,
        record.fullName,
        record.email,
        record.adults,
        record.children,
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
  if (!isRegistrationEnabled()) {
    return NextResponse.json(
      { message: "Die Anmeldung ist aktuell geschlossen." },
      { status: 503 }
    );
  }

  const payload = await request.json();
  const { fullName, email, adults, children, attending, message } = payload;

  const trimmedName = typeof fullName === "string" ? fullName.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const adultCount = Math.max(0, Number(adults) || 0);
  const childCount = Math.max(0, Number(children) || 0);
  const attendingIds = Array.isArray(attending) ? attending : [];

  const validEventIds = new Set(eventOptions.map((option) => option.id));
  const invalidSelection = attendingIds.some((id) => !validEventIds.has(id));

  if (!trimmedName || !trimmedEmail || invalidSelection || attendingIds.length === 0 || adultCount < 1) {
    return NextResponse.json(
      { message: "Bitte gebt euren Namen, eure E-Mail-Adresse, mindestens einen erwachsenen Gast und einen Programmpunkt an." },
      { status: 400 }
    );
  }

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fullName: trimmedName,
    email: trimmedEmail,
    adults: adultCount,
    children: childCount,
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
