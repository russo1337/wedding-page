import WishlistList from "./wishlist-list";

export const metadata = {
  title: "Wunschliste | Unsere Hochzeitsfeier"
};

export default function WishlistPage() {
  return (
    <section>
      <span className="tag">Wunschliste</span>
      <h1>Wählt ein Geschenk aus</h1>
      <p>
        Eure Anwesenheit ist unser größtes Geschenk, aber wenn ihr unsere Flitterwochen unterstützen möchtet,
        könnt ihr unten eine Erfahrung für uns reservieren.
      </p>
      <WishlistList />
    </section>
  );
}
