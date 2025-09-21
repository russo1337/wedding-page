import { NextResponse } from "next/server";
import { wishlistGifts } from "@/lib/data";

const gifts = wishlistGifts.map((gift) => ({
  ...gift,
  reservedBy: null,
  note: ""
}));

export async function GET() {
  return NextResponse.json({ gifts });
}

export async function POST(request) {
  const payload = await request.json();
  const { giftId, name, message } = payload;

  const target = gifts.find((gift) => gift.id === giftId);

  if (!target) {
    return NextResponse.json({ message: "Geschenk wurde nicht gefunden." }, { status: 404 });
  }

  if (target.reservedBy) {
    return NextResponse.json(
      { message: "Dieses Geschenk wurde bereits reserviert." },
      { status: 409 }
    );
  }

  target.reservedBy = typeof name === "string" && name.trim() ? name.trim() : "Ein lieber Gast";
  target.note = typeof message === "string" ? message.trim() : "";

  return NextResponse.json({
    message: "Vielen Dank für eure Reservierung!",
    gift: target
  });
}
