# Deploy to Vercel - Quick Guide

## ✅ Status
- ✅ Vercel CLI installed
- ✅ Logged into Vercel
- ⚠️ Permission issue with CLI (use GitHub method instead)

## 🚀 Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

If you haven't already, initialize git and push:

```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New Project"
3. **Import** your GitHub repository
4. **Configure**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: **./**
   - Build Command: `prisma generate && prisma migrate deploy && next build` (already configured)
   - Install Command: `npm install`
5. **Add Environment Variables** (click "Environment Variables"):
   
   **Required:**
   ```
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.crtjxsliemxtrmxvbksq.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```
   *(Replace [YOUR_PASSWORD] with your actual Supabase password)*
   
   ```
   NEXTAUTH_SECRET=ISjcXu9EpLnUQHmO2gFToiAaRNYB38KM
   ```
   
   ```
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```
   *(You'll update this after first deploy with your actual URL)*

6. **Click**: "Deploy"

### Step 3: Update NEXTAUTH_URL

After deployment:
1. Copy your app URL (e.g., `https://stripping-app.vercel.app`)
2. Go to **Settings → Environment Variables**
3. Update `NEXTAUTH_URL` with your actual URL
4. **Redeploy** (Deployments → Latest → Redeploy)

## 🎉 Done!

Your app will be live at: `https://your-app-name.vercel.app`

## Alternative: Fix CLI Permission Issue

If you want to use CLI, try:
1. Run PowerShell/CMD as Administrator
2. Or set: `$env:VERCEL_DIR="$env:USERPROFILE\.vercel"` before running commands

But GitHub method is easier and enables automatic deployments! 🚀

