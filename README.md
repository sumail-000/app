# Stripping App

A Next.js web application for connecting performers with clients.

## Features

- User authentication (performers and clients)
- Profile management
- Content upload (photos/videos)
- Booking system for private shows
- Messaging system
- Payment processing with Stripe
- Real-time notifications

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Styling:** Tailwind CSS
- **File Uploads:** Cloudinary

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate a random string
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."  # Optional, for payments
STRIPE_WEBHOOK_SECRET="whsec_..."  # Optional, for payments
GOOGLE_CLIENT_ID="..."  # Optional, for OAuth
GOOGLE_CLIENT_SECRET="..."  # Optional, for OAuth
GITHUB_ID="..."  # Optional, for OAuth
GITHUB_SECRET="..."  # Optional, for OAuth
```

To generate NEXTAUTH_SECRET on Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
/app
  /api          - API routes
  /dashboard    - User dashboard
  /profiles     - Performer profiles
  /bookings     - Booking management
  /messages     - Messaging system
/components     - React components
/lib            - Utilities and helpers
/prisma         - Database schema
```

## Development

- Run migrations: `npx prisma migrate dev`
- View database: `npx prisma studio`
- Generate Prisma client: `npx prisma generate`

