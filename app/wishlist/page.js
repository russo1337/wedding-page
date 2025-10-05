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
        Euer grösstes Geschenk an uns ist, dass ihr mit uns feiert 🎉. 
        Wer uns darüber hinaus noch eine Freude machen möchte: 
        nach dem Sommerfest starten wir zu einer 6-wöchigen Reise quer durch Italien. 
        Dafür haben wir eine Wunschliste mit kleinen und grösseren Bausteinen erstellt – 
        von Gelato in Palermo bis Campingnacht am Strand. 
        So begleitet ihr uns ein Stück auf unserem Abenteuer!
      </p>
      <WishlistList />
    </section>
  );
}
