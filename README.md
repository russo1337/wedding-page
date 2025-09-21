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
- `npm run dev` – start the Next.js development server
- `npm run build` – create an optimized production build
- `npm run start` – run the production build locally
- `npm run lint` – run the default Next.js ESLint rules

## Features
- **RSVP form** at `/register` with guest count, event selection, and optional notes
- **Wishlist page** at `/wishlist` where guests can reserve gift experiences
- **In-memory API routes** under `/api/register` and `/api/wishlist` for quick prototyping (replace with persistent storage for production)

## Next steps
- Connect `/api/register` and `/api/wishlist` to a real database or third-party service
- Add authentication or invite codes if you want to restrict access
- Customise styling, copy, and imagery to match your celebration
