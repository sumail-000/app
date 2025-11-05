# Quick Vercel Deployment Guide

## ✅ Already Done
- ✅ Database tables created in Supabase
- ✅ Prisma schema updated to PostgreSQL
- ✅ `.env` file updated with connection string template

## 🔧 Final Steps

### 1. Update `.env` File
Replace `[YOUR_PASSWORD]` in `.env` with your actual Supabase database password.

To get your password:
1. Go to Supabase Dashboard → Settings → Database
2. Under "Database password", click "Reset database password" or use your existing password
3. Replace `[YOUR_PASSWORD]` in `.env` with the actual password

### 2. Generate Prisma Client Locally
```bash
npx prisma generate
```

### 3. Test Locally (Optional)
```bash
npm run dev
```
Make sure everything works before deploying.

### 4. Deploy to Vercel

#### Option A: Vercel CLI (Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

When prompted:
- Link to existing project? **No** (first time)
- Project name: **stripping-app** (or your choice)
- Directory: **./** (current directory)
- Override settings? **No**

#### Option B: GitHub + Vercel Dashboard
1. Push to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. Go to vercel.com → Add New Project → Import from GitHub
3. Select your repository
4. Click "Deploy"

### 5. Add Environment Variables in Vercel

After first deployment, go to:
**Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

**Required:**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.crtjxsliemxtrmxvbksq.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```
*(Replace [YOUR_PASSWORD] with actual password)*

```
NEXTAUTH_SECRET=ISjcXu9EpLnUQHmO2gFToiAaRNYB38KM
```
*(Or generate new: `openssl rand -base64 32`)*

```
NEXTAUTH_URL=https://your-app-name.vercel.app
```
*(Replace with your actual Vercel URL)*

**Optional (if using OAuth):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_ID`
- `GITHUB_SECRET`

**Optional (if using Stripe):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Optional (if using Cloudinary):**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 6. Redeploy After Adding Variables

After adding environment variables:
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

Or just push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## 🎉 Done!

Your app should now be live at: `https://your-app-name.vercel.app`

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure `DATABASE_URL` is set correctly
- Verify password doesn't have special characters that need URL encoding

### Database Connection Errors
- Double-check `DATABASE_URL` in Vercel environment variables
- Ensure password is correct
- Try connection pooling URL format

### Prisma Errors
- Make sure `prisma generate` runs in build (already configured)
- Check that `postinstall` script is in package.json (already added)

