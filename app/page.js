import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section>
        <span className="tag">20.09.2026</span>
        <h1>Wir heiraten!</h1>
        <p>
          Feiert mit uns, Sandra und Riccardo Russo, ein Wochenende voller Liebe, Lachen und Erinnerungen in Ennetaach.
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
          <article className="card">
            <h3>Willkommensabend</h3>
            <p>Freitag - 18:00 Uhr - Südhalde 1</p>
            <p>
              Stoßt mit uns auf die kommenden Tage an bei Aperitivi, guter Musik und Sonnenuntergang über Ennetaach.
            </p>
          </article>
          <article className="card">
            <h3>Zeremonie & Trauung</h3>
            <p>Samstag - 16:00 Uhr - Südhalde 1</p>
            <p>
              Gemeinsam mit euch sagen wir Ja und starten als Familie Russo in unseren neuen Lebensabschnitt.
            </p>
          </article>
          <article className="card">
            <h3>Fest & Abendessen</h3>
            <p>Samstag - 19:00 Uhr - Südhalde 1</p>
            <p>
              Freut euch auf regionale Küche, Kerzenschein und eine lange Nacht voller Tanz und Geschichten.
            </p>
          </article>
          <article className="card">
            <h3>Abschiedsbrunch</h3>
            <p>Sonntag - 11:00 Uhr - Ennetaach</p>
            <p>
              Bevor ihr abreist, genießen wir gemeinsam Kaffee, süße Leckereien und die schönsten Erinnerungen des Wochenendes.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
