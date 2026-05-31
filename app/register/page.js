import RegisterForm from "./register-form";
import { eventOptions } from "@/lib/data";
import { isRegistrationEnabled } from "@/lib/features";

export const metadata = {
  title: "Anmeldung | Unsere Hochzeitsfeier"
};

export default function RegisterPage() {
  const registrationEnabled = isRegistrationEnabled();

  if (!registrationEnabled) {
    return (
      <section>
        <span className="tag">Anmeldung</span>
        <h1>Die Anmeldung ist geschlossen</h1>
        <p>
          Die reguläre Anmeldung ist abgeschlossen. Wenn ihr noch teilnehmen möchtet,
          meldet euch bitte direkt bei uns, damit wir prüfen können, ob eine Anmeldung
          noch möglich ist.
        </p>
      </section>
    );
  }

  return (
    <section>
      <span className="tag">Anmeldung</span>
      <h1>Sagt uns, dass ihr dabei seid</h1>
      <p>
        Bitte füllt pro Haushalt ein Formular aus, damit wir Sitzplätze, Fahrten und alle Details planen können.
        Nach dem Absenden erhaltet ihr eine Bestätigung mit allen wichtigen Infos.
      </p>
      <RegisterForm eventOptions={eventOptions} />
    </section>
  );
}
