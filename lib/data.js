export const weddingEvents = [
  {
    id: "mittagessen",
    title: "Mittagessen",
    day: "Samstag",
    time: "12:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Eintreffen ab 12:00. Das Mittagessen mit Risotto- und Salat-Buffet startet um 12:30. Achtung: Das Risotto kann nicht lange auf der Flamme bleiben. Es gibt verschiedene Risottos und Salate. Anschliessend fliesender Übergang in den Nachmittag."
  },
  {
    id: "nachmittag",
    title: "Nachmittag mit Apéro und Kinderprogramm",
    day: "Samstag",
    time: "14:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Ab 14:00 Uhr steht das Apéro mit süssen und salzigen Snacks bereit. Anschliessend erwarten die kleinsten Gäste ein grosses Kinderprogramm mit Gumpischloss, Kinder-Olympiade und vielem mehr. Perfekt für Familien mit Kindern."
  },
  {
    id: "abend",
    title: "Abendessen und Party",
    day: "Samstag",
    time: "18:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Eintreffen ab 18:00. Ab 18:30 wird der Spiessligrill angefeuert und das Salatbuffet eröffnet. Anschliessend wartet ein Dessertbuffet für alle, die noch ein bisschen Platz gelassen haben. Danach wird gefeiert, getanzt und gelacht - voraussichtlich bis ca. 02:00 oder bis die letzten Füsse aufgeben."
  },
  {
    id: "brunch",
    title: "Brunch",
    day: "Sonntag",
    time: "09:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Ab 09:00 Uhr steht der gemeinsame Brunch zum Ausklang des Wochenendes bereit. Für alle, die noch nicht genug haben! Aber auch wer nur zum Brunch kommen möchte, ist herzlich willkommen."
  }
];

export const eventOptions = weddingEvents.map((event) => ({
  id: event.id,
  label: `${event.day}: ${event.title}`,
  description: event.summary
}));
