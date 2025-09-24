export const weddingEvents = [
  {
    id: "mittag",
    title: "Mittagessen & Apéro",
    day: "Samstag",
    time: "13:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Mittagessen (Infos folgen) und Apéro. Drinnen und draussen für Gross und Klein. Für die kleinen Gäste gibt es eine Hüpfburg und Spiele."
  },
  {
    id: "abend",
    title: "Fest & Abendessen",
    day: "Samstag",
    time: "19:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Nachtessen (Infos folgen), Party, Tanz und Spass bis in die frühen Morgenstunden."
  },
  {
    id: "brunch",
    title: "Brunch",
    day: "Sonntag",
    time: "11:00 Uhr",
    location: "Eventraum, Hauptstrasse 78, 8588 Zihlschlacht",
    summary: "Gemeinsamer Brunch zum Ausklang des Wochenendes. Für alle, die noch nicht genug haben! Aber auch wer nur zum Brunch kommen möchte, ist herzlich willkommen."
  }
];

export const eventOptions = weddingEvents.map((event) => ({
  id: event.id,
  label: `${event.day}: ${event.title}`,
  description: event.summary
}));
