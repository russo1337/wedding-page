import "./globals.css";
import { isRegistrationEnabled } from "@/lib/features";
import SiteHeader from "./site-header";

export const metadata = {
  title: "Hochzeitsfeier von Sandra & Riccardo",
  description: "Melde dich zur Feier an und entdecke unsere Wunschliste."
};

export default function RootLayout({ children }) {
  const registrationEnabled = isRegistrationEnabled();

  return (
    <html lang="de">
      <body>
        <SiteHeader registrationEnabled={registrationEnabled} />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>Wir können es kaum erwarten, mit euch zu feiern!</span>
            <span>Familie Russo - Südhalde 1, 8586 Ennetaach</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
