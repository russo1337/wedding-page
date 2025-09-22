import { google } from "googleapis";

const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
let sheetsClientPromise = null;

function assertServiceCredentials() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail || !privateKeyRaw) {
    throw new Error("Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  return { clientEmail, privateKey };
}

export async function getSheetsClient() {
  if (!sheetsClientPromise) {
    const { clientEmail, privateKey } = assertServiceCredentials();
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      },
      scopes
    });

    sheetsClientPromise = auth.getClient().then((authClient) => google.sheets({ version: "v4", auth: authClient }));
  }

  return sheetsClientPromise;
}

export function resetSheetsClientCache() {
  sheetsClientPromise = null;
}
