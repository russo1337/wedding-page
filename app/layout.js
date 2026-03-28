import "./globals.css";
import Link from "next/link";
import { isRegistrationEnabled } from "@/lib/features";

export const metadata = {
  title: "Hochzeitsfeier von Sandra & Riccardo",
  description: "Melde dich zur Feier an und entdecke unsere Wunschliste."
};

export default function RootLayout({ children }) {
  const registrationEnabled = isRegistrationEnabled();

  return (
    <html lang="de">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="site-brand">
              <span className="site-brand-kicker">Sommerfest 2026</span>
              <strong>Sandra & Riccardo</strong>
            </Link>
            <ul className="site-nav-links">
              {registrationEnabled && (
                <li><Link href="/register">Anmeldung</Link></li>
              )}
              <li><Link href="/wishlist">Wunschliste</Link></li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Wir koennen es kaum erwarten, mit euch zu feiern!</span>
            <span>Familie Russo - Suedhalde 1, 8586 Ennetaach</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
