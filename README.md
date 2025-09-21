# Wedding Page

A Next.js wedding website that includes RSVP registration, event selections, and a honeymoon wishlist that guests can reserve.

## Prerequisites
- Node.js 18.17+ (or any version supported by Next.js 14)
- npm 9+

## Getting started
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the development server
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 to view the site.

## Available scripts
- `npm run dev` - start the Next.js development server
- `npm run build` - create an optimized production build
- `npm run start` - run the production build locally
- `npm run lint` - run the default Next.js ESLint rules

## Features
- **RSVP form** at `/register` with guest count, event selection, and optional notes
- **Wishlist page** at `/wishlist` where guests can reserve gift experiences
- **In-memory API routes** under `/api/register` and `/api/wishlist` for quick prototyping (replace with persistent storage for production)

## Google Sheets RSVP storage
1. Open the [Google Cloud Console](https://console.cloud.google.com/), create (or select) a project, and enable the **Google Sheets API** under *APIs & Services*.
2. Create a service account in *IAM & Admin > Service accounts*, then add a new JSON key and download the credentials file.
3. Create or choose a Google Sheet for your RSVPs and share it with the service account email so it has editor access.
4. Copy the following values from the JSON key into `.env.local`, escaping the private key line breaks with `\n`:
   ```dotenv
   GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_SPREADSHEET_ID=your-sheet-id
   GOOGLE_SHEETS_WORKSHEET_NAME=Registrations
   ```
   - The sheet ID is the part between `/d/` and `/edit` in the Google Sheets URL.
   - `GOOGLE_SHEETS_WORKSHEET_NAME` is optional; it defaults to `Registrations` if left empty.
5. Restart the development server so Next.js picks up the new environment variables, then submit a test RSVP to confirm a new row appears in the sheet.

## Next steps
- Connect `/api/register` and `/api/wishlist` to a real database or third-party service
- Add authentication or invite codes if you want to restrict access
- Customise styling, copy, and imagery to match your celebration
