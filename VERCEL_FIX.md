# Fix Vercel Deployment Error

## Error Fixed ✅
- Removed `prisma migrate deploy` from build (migrations already applied)
- Updated build command to only generate Prisma client

## ⚠️ IMPORTANT: Add Environment Variable in Vercel

The error shows `DATABASE_URL` is missing. You MUST add it in Vercel:

### Steps:
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[YOUR_PASSWORD]@db.crtjxsliemxtrmxvbksq.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`
   - **Environment**: Select **Production**, **Preview**, and **Development**
   - Replace `[YOUR_PASSWORD]` with your actual Supabase password
4. Click **Save**

### Also Add These:
- `NEXTAUTH_SECRET` = `ISjcXu9EpLnUQHmO2gFToiAaRNYB38KM`
- `NEXTAUTH_URL` = `https://your-app-name.vercel.app` (update after first deploy)

## After Adding Variables:
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

Or push a new commit:
```bash
git add .
git commit -m "Fix build command"
git push
```

## Optional: Update Prisma (if still needed)
If Vercel still shows Prisma version warning, you can update locally:
```bash
npm i --save-dev prisma@latest
npm i @prisma/client@latest
git add package.json package-lock.json
git commit -m "Update Prisma"
git push
```

