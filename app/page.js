import Link from "next/link";
import { weddingEvents } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      <section>
        <span className="tag">20.09.2026</span>
        <h1>Wir heiraten!</h1>
        <p>
          Feiert mit uns, Sandra und Riccardo Russo, ein Wochenende voller Liebe, Lachen und Erinnerungen in Zihlschlacht.
          Meldet euch bitte an und schaut euch unsere Wunschliste an, wenn ihr uns mit einer Aufmerksamkeit überraschen möchtet.
        </p>
        <div className="cta-group">
          <Link href="/register" className="primary-button">Jetzt anmelden</Link>
          <Link href="/wishlist" className="secondary-button">Wunschliste ansehen</Link>
        </div>
      </section>

      <section>
        <h2>Ablauf des Wochenendes</h2>
        <div className="card-grid">
          {weddingEvents.map((event) => (
            <article key={event.id} className="card">
              <h3>{event.title}</h3>
              <p>{`${event.day} - ${event.time}`}</p>
              <p>{`${event.location}`}</p>
              <p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

