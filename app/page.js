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
          <h1>Wir haben geheiratet!</h1>
          <p className="hero-quote">
            Momente vergehen, doch Erinnerungen bleiben - tief im Herzen, wo sie für immer leuchten.
          </p>
        </div>
        <div className="hero-photo">
          <Image
            src="/images/married.jpg"
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
          <h1>Russo&apos;s Sommerfest</h1>
          <p>
            Kommt zu einem oder gleich zu mehreren Festblöcken, ganz wie ihr mögt:
          </p>
          <ul>
            <li>Samstag: Mittagessen</li>
            <li>Samstag: Apéro und Kinderprogramm</li>
            <li>Samstag: Nachtessen und Party</li>
            <li>Sonntag: Brunch</li>
          </ul>
          <p>
            Wir freuen uns riesig, mit euch zu feiern! <br />
            Ganz ohne Trauung, Dresscode, weisses Kleid oder klassischen Hochzeitsrahmen - einfach ein Fest mit euch.
          </p>
          <p>
            <b>Bitte meldet euch bis zum 31. Mai 2026 an, damit wir besser planen können. </b><br />
          </p>
        </div>
        
        <div className="hero-subsection">
          <div className="section-heading">
            <h2 className="subsection-title">Allgemeine Infos</h2>
          </div>
          <div className="card-grid info-grid">
            <article className="card info-card">
              <h3>Location</h3>
              <p>
                Gefeiert wird im <a className="info-link" href="https://www.eventblumen.ch/eventraum" target="_blank" rel="noreferrer">
                  Eventraum Eventblumen Andrea Brühlmann
                </a>
                .
              </p>
            </article>
            <article className="card info-card">
              <h3>Parken</h3>
              <p>Es sind einige Parkplätze vorhanden. Fahrgemeinschaften sind sehr willkommen.</p>
            </article>
            <article className="card info-card">
              <h3>ÖV Verbindung</h3>
              <p>Zug nach Amriswil und von dort mit dem Bus 943 nach Zihlschlacht Oberdorf. Danach sind es noch etwa 5 Minuten zu Fuss bis zur Location. Die späteste Verbindung zurück ist um 00:37 Uhr.</p>
            </article>
            <article className="card info-card">
              <h3>Kinder</h3>
              <p>Für Kinder gibt es ein schönes Programm. Die Aufsicht liegt bei den Eltern. Bitte achtet auf die nahe Hauptstrasse und das offene Biotop.</p>
            </article>
            <article className="card info-card">
              <h3>Dresscode</h3>
              <p>Es gibt keinen Dresscode. Kommt einfach so, wie ihr euch wohl fühlt.</p>
            </article>
            <article className="card info-card">
              <h3>Geschenke</h3>
              <p>Das grösste Geschenk ist, dass ihr mit uns feiert 🎉 Wer uns zusätzlich eine Freude machen möchte, kann uns mit einem Beitrag zu unserer Italienreise beschenken.</p>
            </article>
          </div>
        </div>

        <div className="hero-subsection">
          <div className="section-heading">
            <h2 className="subsection-title">Ablauf</h2>
          </div>
          <div className="card-grid event-grid">
            {weddingEvents.map((event) => (
              <article key={event.id} className="card">
                <h3>{event.title}</h3>
                <p className="event-meta">{`${event.day} - ${event.time}`}</p>
                <p className="event-location">{event.location}</p>
                <p>{event.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-subsection">
          <div className="cta-group">
            {registrationEnabled ? (
              <Link href="/register" className="primary-button">Jetzt anmelden</Link>
            ) : (
              <span style={{ fontWeight: 600, color: "#0f594a" }}>Die Anmeldung öffnet bald.</span>
            )}
            <Link href="/wishlist" className="secondary-button">Wunschliste ansehen</Link>
          </div>
        </div>
      </section>
    </>
  );
}
