export function renderContributionEmail({
  recipientName,
  recipientEmail,
  giftTitle,
  parts,
  contributionAmount,
  eventDate,
  bankIban = "CH00 1234 5678 9012 3456 7",
  bankReference = "Sandra & Riccardo",
  bankAccountHolder = "Sandra & Riccardo Russo",
  message,
  additionalInfo
}) {
  const safe = (value) => (value ?? "").toString();
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Vielen Dank für euren Beitrag</title>
<style>
  body {
    margin: 0;
    padding: 2rem;
    font-family: 'Inter', Arial, sans-serif;
    background: #f3fbf7;
    color: #123a32;
  }
  .container {
    max-width: 560px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 18px 40px rgba(18, 58, 50, 0.12);
    overflow: hidden;
  }
  .header {
    padding: 2.5rem 2.5rem 1.5rem;
    background: linear-gradient(135deg, #8becc5, #1fbba4);
    color: #ffffff;
  }
  .header h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
  }
  .header p {
    margin: 0;
    font-size: 1rem;
    opacity: 0.9;
  }
  .content {
    padding: 2.5rem;
    line-height: 1.6;
  }
  h2 {
    font-size: 1.25rem;
    margin-top: 2rem;
    margin-bottom: 0.5rem;
    color: #0f594a;
  }
  .card {
    background: #f3fbf7;
    border-radius: 16px;
    padding: 1.5rem;
    margin-top: 1rem;
    border: 1px solid rgba(18, 90, 67, 0.18);
  }
  .banking {
    background: #ffffff;
    border: 1px solid rgba(18, 90, 67, 0.15);
    border-radius: 16px;
    padding: 1.5rem;
  }
  .banking dt {
    font-weight: 600;
    color: #0f594a;
  }
  .banking dd {
    margin: 0 0 0.75rem;
  }
  .cta {
    margin-top: 2.5rem;
    padding: 1.75rem;
    text-align: center;
    background: rgba(18, 90, 67, 0.08);
    border-radius: 16px;
  }
  .cta strong {
    color: #0f594a;
  }
  @media (max-width: 600px) {
    body {
      padding: 1rem;
    }
    .content, .header {
      padding: 1.75rem;
    }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Danke euch, ${safe(recipientName) || "liebe Gäste"}!</h1>
      <p>Wir freuen uns riesig über euren Beitrag zu unserem Fest.</p>
    </div>
    <div class="content">
      <p>Ihr habt euch für das Geschenk <strong>${safe(giftTitle)}</strong> entschieden${parts ? ` und ${parts} Anteil(e)` : ""}. Das bedeutet uns unglaublich viel – vielen Dank für eure Unterstützung!</p>
      ${eventDate ? `<p>Wir freuen uns darauf, euch am <strong>${safe(eventDate)}</strong> zu sehen.</p>` : ""}

      <div class="card">
        <h2>Eure Angaben</h2>
        <p><strong>Name:</strong> ${safe(recipientName) || "–"}</p>
        <p><strong>E-Mail:</strong> ${safe(recipientEmail) || "–"}</p>
        ${contributionAmount ? `<p><strong>Gesamter Beitrag:</strong> ${safe(contributionAmount)}</p>` : ""}
        ${message ? `<p><strong>Nachricht:</strong><br/>${safe(message)}</p>` : ""}
      </div>

      <h2>Zahlungsinformationen</h2>
      <dl class="banking">
        <dt>Kontoinhaberin / Kontoinhaber</dt>
        <dd>${safe(bankAccountHolder)}</dd>
        <dt>IBAN</dt>
        <dd>${safe(bankIban)}</dd>
        <dt>Zahlungsreferenz</dt>
        <dd>${safe(bankReference)}</dd>
      </dl>

      ${additionalInfo ? `<div class="card">${safe(additionalInfo)}</div>` : ""}

      <div class="cta">
        <p>Falls ihr Fragen habt oder etwas ändern möchtet,
        schreibt uns jederzeit. Wir freuen uns schon sehr darauf,
        mit euch anzustoßen!</p>
        <p><strong>Herzlich,<br/>Sandra & Riccardo</strong></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
