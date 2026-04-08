function escapeHtml(value) {
  return (value ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInfoRow(label, value) {
  return `<div class="info-row">
    <div class="info-label">${escapeHtml(label)}</div>
    <div class="info-value">${escapeHtml(value) || "-"}</div>
  </div>`;
}

export function renderContributionEmail({
  recipientName,
  recipientEmail,
  items = [],
  totalAmountLabel,
  bankIban = "CH42 0023 9239 1023 3340 E",
  bankReference = "Russo Geschenk",
  bankAccountHolder = "Sandra & Riccardo Russo",
  twintNumber = "+41 79 820 38 99",
  twintRecipient = "Riccardo",
  message,
  additionalInfo
}) {
  const safeName = escapeHtml(recipientName) || "liebe Gäste";
  const safeMessage = escapeHtml(message);
  const safeAdditionalInfo = escapeHtml(additionalInfo);

  const itemsHtml = items.length
    ? `<div class="section">
        <h2>Ausgewählte Geschenke</h2>
        <div class="list">
          ${items
            .map((item) => `<div class="list-item">
              <div class="item-title">${escapeHtml(item.title)}</div>
              <div class="item-meta">Anteile: ${escapeHtml(item.parts)}</div>
              ${item.amountLabel ? `<div class="item-meta">Betrag: ${escapeHtml(item.amountLabel)}</div>` : ""}
            </div>`)
            .join("")}
        </div>
      </div>`
    : "";

  const totalHtml = totalAmountLabel
    ? `<div class="section">
        <h2>Gesamtsumme</h2>
        <p class="total">${escapeHtml(totalAmountLabel)}</p>
      </div>`
    : "";

  const messageHtml = safeMessage
    ? `<div class="section">
        <h2>Nachricht</h2>
        <p>${safeMessage}</p>
      </div>`
    : "";

  const additionalInfoHtml = safeAdditionalInfo
    ? `<div class="section">
        <h2>Weitere Informationen</h2>
        <p>${safeAdditionalInfo}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Vielen Dank für euren Beitrag</title>
<style>
  body {
    margin: 0;
    padding: 24px;
    font-family: Arial, sans-serif;
    background: #f4f7f5;
    color: #17352f;
  }
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  .container {
    background: #ffffff;
    border: 1px solid #d9e6e0;
    border-radius: 16px;
    overflow: hidden;
  }
  .header {
    padding: 32px 32px 24px;
    background: #1f6f5f;
    color: #ffffff;
  }
  .header h1 {
    margin: 0 0 8px;
    font-size: 28px;
    line-height: 1.2;
  }
  .header p {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
  }
  .content {
    padding: 32px;
  }
  .intro {
    margin: 0 0 24px;
    font-size: 16px;
    line-height: 1.6;
  }
  .section {
    margin-top: 16px;
    padding: 20px;
    background: #f8fbf9;
    border: 1px solid #d9e6e0;
    border-radius: 12px;
  }
  .section h2 {
    margin: 0 0 16px;
    font-size: 18px;
    line-height: 1.3;
    color: #1f6f5f;
  }
  .section p {
    margin: 0;
    font-size: 15px;
    line-height: 1.6;
  }
  .info-row {
    padding: 10px 0;
    border-top: 1px solid #d9e6e0;
  }
  .info-row:first-child {
    padding-top: 0;
    border-top: 0;
  }
  .info-label {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 700;
    color: #1f6f5f;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .info-value {
    font-size: 15px;
    line-height: 1.5;
  }
  .list {
    display: block;
  }
  .list-item {
    padding: 12px 0;
    border-top: 1px solid #d9e6e0;
  }
  .list-item:first-child {
    padding-top: 0;
    border-top: 0;
  }
  .item-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.5;
  }
  .item-meta {
    margin-top: 4px;
    font-size: 14px;
    line-height: 1.5;
    color: #45635b;
  }
  .total {
    font-size: 24px;
    font-weight: 700;
    color: #1f6f5f;
  }
  .footer {
    padding: 24px 32px 32px;
    font-size: 15px;
    line-height: 1.6;
  }
  .footer p {
    margin: 0 0 12px;
  }
  .footer p:last-child {
    margin-bottom: 0;
  }
  @media (max-width: 600px) {
    body {
      padding: 12px;
    }
    .header,
    .content,
    .footer {
      padding-left: 20px;
      padding-right: 20px;
    }
  }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Danke euch, ${safeName}!</h1>
        <p>Wir freuen uns sehr über euren Beitrag zu unserem Fest.</p>
      </div>

      <div class="content">
        <p class="intro">Ihr habt für uns eine Auswahl an Geschenken reserviert. Vielen Dank für eure Unterstützung.</p>

        <div class="section">
          <h2>Eure Angaben</h2>
          ${renderInfoRow("Name", recipientName)}
          ${renderInfoRow("E-Mail", recipientEmail)}
        </div>

        ${messageHtml}
        ${itemsHtml}
        ${totalHtml}

        <div class="section">
          <h2>Zahlungsinformationen</h2>
          ${renderInfoRow("TWINT Empfänger", twintRecipient)}
          ${renderInfoRow("TWINT Nummer", twintNumber)}
          ${renderInfoRow("TWINT Referenz", bankReference)}
          ${renderInfoRow("Kontoinhaber", bankAccountHolder)}
          ${renderInfoRow("IBAN", bankIban)}
          ${renderInfoRow("Bank Referenz", bankReference)}
        </div>

        ${additionalInfoHtml}
      </div>

      <div class="footer">
        <p>Falls ihr Fragen habt oder etwas ändern möchtet, meldet euch jederzeit.</p>
        <p><strong>Herzlich<br />Sandra & Riccardo</strong></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
