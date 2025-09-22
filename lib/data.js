export const weddingEvents = [
   {
    id: "mittag",
    title: "Mittagessen & Apéro",
    day: "Samstag",
    time: "13:00 Uhr",
    location: "Südhalde 1",
    summary: "Aperitivi, regionale Häppchen und Zeit für Gespräche, bevor die Feier so richtig beginnt."
  },
  {
    id: "abend",
    title: "Fest & Abendessen",
    day: "Samstag",
    time: "19:00 Uhr",
    location: "Südhalde 1",
    summary: "Freut euch auf regionale Küche, Kerzenschein und eine lange Nacht voller Tanz und Geschichten."
  },
  {
    id: "brunch",
    title: "Abschiedsbrunch",
    day: "Sonntag",
    time: "11:00 Uhr",
    location: "Ennetaach",
    summary: "Bevor ihr abreist, genießen wir gemeinsam Kaffee, süße Leckereien und die schönsten Erinnerungen des Wochenendes."
  }
];

export const eventOptions = weddingEvents.map((event) => ({
  id: event.id,
  label: `${event.day}: ${event.title}`,
  description: event.summary
}));
