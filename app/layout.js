import "./globals.css";
import Link from "next/link";
import { Inter } from "next/font/google";
import { isRegistrationEnabled } from "@/lib/features";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hochzeitsfeier von Sandra & Riccardo",
  description: "Melde dich zur Feier an und entdecke unsere Wunschliste."
};

export default function RootLayout({ children }) {
  const registrationEnabled = isRegistrationEnabled();

  return (
    <html lang="de">
      <body className={inter.className}>
        <header>
          <nav>
            <Link href="/">
              <strong>Sandra & Riccardo</strong>
            </Link>
            <ul>
              {registrationEnabled && (
                <li><Link href="/register">Anmeldung</Link></li>
              )}
              <li><Link href="/wishlist">Wunschliste</Link></li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <div>
            <span>Wir können es kaum erwarten, mit euch zu feiern!</span>
            <span>Familie Russo - Südhalde 1, 8586 Ennetaach</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
