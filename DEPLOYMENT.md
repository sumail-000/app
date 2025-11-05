# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: You'll need a hosted PostgreSQL database (recommended: [Supabase](https://supabase.com) or [Vercel Postgres](https://vercel.com/storage/postgres))

## Step 1: Set Up PostgreSQL Database

### Option A: Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (it will look like: `postgresql://postgres:[password]@[host]:5432/postgres`)

### Option B: Vercel Postgres
1. In your Vercel dashboard, go to Storage → Create Database → Postgres
2. After creation, copy the connection string from the dashboard

## Step 2: Update Prisma Schema

Change the database provider in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name migrate_to_postgres
```

## Step 3: Deploy to Vercel

### Method 1: Via Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: **stripping-app** (or your choice)
   - Directory: **./** (current directory)
   - Override settings? **No**

5. Add environment variables:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

Or set them in Vercel Dashboard → Project → Settings → Environment Variables

### Method 2: Via GitHub (Recommended for continuous deployment)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: **./**
   - Build Command: `prisma generate && prisma migrate deploy && next build`
   - Install Command: `npm install`
6. Add Environment Variables (see below)
7. Click "Deploy"

## Step 4: Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

### Required Variables:

```
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]?schema=public
NEXTAUTH_SECRET=[generate a random secret, use: openssl rand -base64 32]
NEXTAUTH_URL=https://your-app.vercel.app
```

### Optional Variables (if using OAuth):

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 5: Run Database Migrations

After first deployment, run migrations:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

Or use Vercel's CLI to run migrations:
```bash
vercel exec -- npx prisma migrate deploy
```

## Step 6: Verify Deployment

1. Visit your app URL: `https://your-app.vercel.app`
2. Test registration/login
3. Check logs in Vercel Dashboard if issues occur

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is set correctly in Vercel
- Check if your database allows connections from Vercel IPs
- Verify SSL is enabled: Add `?sslmode=require` to your DATABASE_URL

### Build Failures
- Check build logs in Vercel Dashboard
- Ensure `prisma generate` runs before build
- Verify all environment variables are set

### Prisma Client Errors
- Run `npx prisma generate` locally
- Commit `prisma` folder to git
- Ensure `postinstall` script in package.json runs `prisma generate`

## Post-Deployment

1. **Custom Domain** (optional): Add in Vercel Dashboard → Settings → Domains
2. **Environment Variables**: Set production values
3. **Monitoring**: Check Vercel Analytics and Logs

## Notes

- SQLite is NOT supported on Vercel (use PostgreSQL)
- Database migrations run automatically on build with `prisma migrate deploy`
- All environment variables must be set in Vercel Dashboard
- `NEXTAUTH_URL` must match your production domain

