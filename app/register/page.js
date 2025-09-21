import RegisterForm from "./register-form";
import { eventOptions } from "@/lib/data";

export const metadata = {
  title: "Anmeldung | Unsere Hochzeitsfeier"
};

export default function RegisterPage() {
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
