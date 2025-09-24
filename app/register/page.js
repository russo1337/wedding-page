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
          Vielen Dank für euer Interesse. Im Moment nehmen wir keine weiteren Anmeldungen entgegen.
          Schaut gern später noch einmal vorbei oder meldet euch direkt bei uns, falls ihr Fragen habt.
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
