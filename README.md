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
   GOOGLE_SHEETS_RESERVATION_WORKSHEET_NAME=Registrations
   GOOGLE_SHEETS_WISHLIST_WORKSHEET_NAME=Wishlist
   GOOGLE_SHEETS_WISHLIST_LOG_WORKSHEET_NAME=Wishlist_Log
   ```
   - The sheet ID is the part between `/d/` and `/edit` in the Google Sheets URL.
   - `GOOGLE_SHEETS_RESERVATION_WORKSHEET_NAME` is used for RSVPs; `GOOGLE_SHEETS_WISHLIST_WORKSHEET_NAME` points to the wishlist tab; `GOOGLE_SHEETS_WISHLIST_LOG_WORKSHEET_NAME` is optional and only needed if you want to track every gift reservation in a separate sheet.
5. Restart the development server so Next.js picks up the new environment variables, then submit a test RSVP to confirm a new row appears in the sheet.

### Wishlist sheet layout
Create a worksheet (e.g. `Wishlist`) with the following header row:

```
id	category	title	description	price	parts	payed	url	imageUrl
```

- `parts` describes how many contributions are available for the gift. `payed` tracks how many parts have already been reserved.
- The wishlist API updates the `payed` column when someone reserves a gift. If you set `GOOGLE_SHEETS_WISHLIST_LOG_WORKSHEET_NAME`, each reservation is also appended to that sheet with timestamp, guest name, message, and the number of parts reserved.

## Mail configuration
This project sends confirmation emails through SMTP. Add the credentials you use to `.env.local`:

```dotenv
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=true
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

Use your provider’s host, username, and password. `SMTP_SECURE=true` assumes an SSL/TLS connection on port 465; adjust these values if you rely on STARTTLS (usually `SMTP_SECURE=false` and port 587).

## Access protection
The site can be protected behind a shared password and feature flags, controlled by environment variables:

```dotenv
SITE_PASSWORD=choose-a-shared-password
REGISTRATION_ENABLED=true
```

- `SITE_PASSWORD` activates the middleware-based login gate. When omitted, the site stays public, which is useful during local development.
- `REGISTRATION_ENABLED` toggles the RSVP flow. Set it to `false`, `0`, `off`, or `no` to hide the registration link, disable the `/register` page, and block `/api/register` submissions.

Restart the Next.js server after changing any environment variables so the new values take effect.

