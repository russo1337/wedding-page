import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Passwortschutz",
  description: "Bitte gib das Passwort ein, um auf die Seite zuzugreifen."
};

function sanitizeRedirect(target) {
  if (!target || typeof target !== "string") {
    return "/";
  }

  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/";
  }

  return target;
}

export default function LoginPage({ searchParams }) {
  const showError = searchParams?.error === "1";
  const configError = searchParams?.error === "config";
  const redirectTo = sanitizeRedirect(searchParams?.from);

  async function authenticate(formData) {
    "use server";

    const submittedPassword = formData.get("password")?.toString() ?? "";
    const expectedPassword = process.env.SITE_PASSWORD;
    const redirectTarget = sanitizeRedirect(formData.get("redirectTo")?.toString());

    if (!expectedPassword) {
      const params = new URLSearchParams({ error: "config" });

      if (redirectTarget && redirectTarget !== "/") {
        params.set("from", redirectTarget);
      }

      redirect(`/login?${params.toString()}`);
    }

    if (submittedPassword === expectedPassword) {
      cookies().set({
        name: "wedding-auth",
        value: "granted",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30 // 30 Tage Zugriff
      });

      redirect(redirectTarget);
    }

    const params = new URLSearchParams({ error: "1" });

    if (redirectTarget && redirectTarget !== "/") {
      params.set("from", redirectTarget);
    }

    redirect(`/login?${params.toString()}`);
  }

  return (
    <section>
      <h1>Passwortgeschützter Bereich</h1>
      <p>Bitte gib das Passwort ein, das wir mit dir geteilt haben.</p>
      <form action={authenticate}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label htmlFor="password">
          <span>Passwort</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {showError && (
          <p className="feedback error">Das Passwort war leider nicht korrekt. Bitte versuch es noch einmal.</p>
        )}

        {configError && (
          <p className="feedback error">Es ist noch kein Passwort hinterlegt. Bitte ergänze die Variable SITE_PASSWORD.</p>
        )}

        <button type="submit">Einloggen</button>
      </form>
    </section>
  );
}
