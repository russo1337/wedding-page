import { NextResponse } from "next/server";
import { eventOptions } from "@/lib/data";

const registrations = [];

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

  registrations.push(record);

  return NextResponse.json(
    {
      message: "Danke! Eure Anmeldung ist eingegangen. Wir melden uns bald mit weiteren Details.",
      registrationId: record.id
    },
    { status: 201 }
  );
}
