"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadBasket } from "@/lib/wishlist-utils";

export default function SiteHeader({ registrationEnabled }) {
  const pathname = usePathname();
  const [basketCount, setBasketCount] = useState(0);

  useEffect(() => {
    const syncBasketCount = () => {
      const basket = loadBasket();
      const count = basket.reduce((total, item) => total + (item.parts || 0), 0);
      setBasketCount(count);
    };

    syncBasketCount();
    window.addEventListener("storage", syncBasketCount);
    window.addEventListener("wishlist-basket-updated", syncBasketCount);

    return () => {
      window.removeEventListener("storage", syncBasketCount);
      window.removeEventListener("wishlist-basket-updated", syncBasketCount);
    };
  }, []);

  const showBasketLink = pathname?.startsWith("/wishlist");

  return (
    <header className="site-header">
      <nav className="site-nav">
        <Link href="/" className="site-brand">
          <span className="site-brand-kicker">Sommerfest 2026</span>
          <strong>Sandra & Riccardo</strong>
        </Link>
        <ul className="site-nav-links">
          {registrationEnabled ? (
            <li><Link href="/register">Anmeldung</Link></li>
          ) : (
            <li>
              <span className="site-nav-note">Anmeldung geschlossen</span>
            </li>
          )}
          <li><Link href="/wishlist">Wunschliste</Link></li>
          {showBasketLink ? (
            <li>
              <Link href="/wishlist/basket" className="primary-button">
                {basketCount > 0 ? `Zum Korb (${basketCount})` : "Zum Korb"}
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}
