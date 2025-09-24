import Image from "next/image";
import Link from "next/link";
import { weddingEvents } from "@/lib/data";
import { isRegistrationEnabled } from "@/lib/features";

export default function HomePage() {
  const registrationEnabled = isRegistrationEnabled();

  return (
    <>
      <section className="hero">
        <div className="hero-sticker">
          <Image
            src="/images/rings-sticker.svg"
            alt="Zwei Trauringe"
            width={140}
            height={140}
            priority
          />
        </div>
        <div className="hero-text">
          <span className="tag">3. Oktober 2025</span>
          <h1>Wir heiraten!</h1>
          <p>
            Am 3. Oktober 2025 heiraten wir standesamtlich im kleinen Rahmen. <br />
            Das grosse Fest für Familie & Freunde folgt im Sommer
          </p>
          <div className="cta-group">
            <Link href="/wishlist" className="secondary-button">Wunschliste ansehen</Link>
          </div>
        </div>
        <div className="hero-photo">
          <Image
            src="/images/kissing.jpg"
            alt="Sandra und Riccardo küssend"
            width={360}
            height={320}
            priority
          />
        </div>
      </section>

      <section className="hero">
        <div className="hero-sticker hero-sticker-right">
          <Image
            src="/images/party-sticker.svg"
            alt="Party Symbol"
            width={140}
            height={140}
            priority
          />
        </div>
        <div className="hero-text">
          <span className="tag">27. & 28. Juni 2026</span>
          <h1>Russo's Sommerfest</h1>
          <p>
            Kommt zu einem oder gleich zu mehreren Festblöcken - ganz wie ihr mögt:
          </p>
          <ul>
            <li>Samstag, Mittag bis Abend</li>
            <li>Samstagabend</li>
            <li>Sonntagmorgen-Brunch</li>
          </ul>
          <p>
            Wir freuen uns riesig, mit euch zu feiern! Ganz ohne Trauung, weisses Kleid oder klassischen Hochzeitsrahmen - einfach ein Fest mit euch.
            Alle weiteren Infos folgen - haltet euch das Datum frei...
          </p>
          <div className="cta-group">
            {registrationEnabled ? (
              <Link href="/register" className="primary-button">Jetzt anmelden</Link>
            ) : (
              <span style={{ fontWeight: 600, color: "#0f594a" }}>Die Anmeldung öffnet bald.</span>
            )}
            <Link href="/wishlist" className="secondary-button">Wunschliste ansehen</Link>
          </div>
        </div>
        <div className="hero-photo">
          <Image
            src="/images/familie-am-see.jpg"
            alt="Sandra und Riccardo am See"
            width={360}
            height={320}
            priority
          />
        </div>
      </section>

      <section>
        <h2>Ablauf Russo's Sommerfest</h2>
        <div className="card-grid">
          {weddingEvents.map((event) => (
            <article key={event.id} className="card">
              <h3>{event.title}</h3>
              <p className="event-meta">{`${event.day} - ${event.time}`}</p>
              <p className="event-location">{event.location}</p>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
