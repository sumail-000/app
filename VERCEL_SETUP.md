# Vercel Deployment Setup

## ✅ Completed
- ✅ Prisma schema updated to PostgreSQL
- ✅ Database tables created in Supabase
- ✅ Vercel configuration files ready

## Next Steps

### 1. Get Supabase Database Connection String

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, copy the **URI** connection string
   - It should look like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
   - Or use the **Connection pooling** URI (recommended for serverless)

### 2. Update Environment Variables

Update your `.env` file with the PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Important**: Add `?pgbouncer=true&connection_limit=1` for Vercel serverless compatibility.

### 3. Generate Prisma Client

Run locally to generate Prisma client:
```bash
npx prisma generate
```

### 4. Deploy to Vercel

#### Option A: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `DATABASE_URL` - Your Supabase PostgreSQL connection string
     - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
     - `NEXTAUTH_URL` - Your Vercel app URL (will be provided after first deploy)

#### Option B: Via GitHub

1. Push to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. Go to vercel.com → Add New Project → Import from GitHub
3. Configure:
   - Framework: Next.js
   - Build Command: (auto-detected, but ensure it includes `prisma generate`)
   - Install Command: `npm install`
4. Add environment variables (same as above)
5. Deploy

### 5. Environment Variables for Vercel

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

**Required:**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)

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

### 6. Verify Deployment

1. Visit your deployed app URL
2. Test registration/login
3. Check Vercel logs if any issues occur

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` uses connection pooling (`pgbouncer=true`)
- Add `?connection_limit=1` for serverless compatibility
- Check Supabase dashboard for connection status

### Build Failures
- Ensure `prisma generate` runs in build command
- Check build logs in Vercel Dashboard
- Verify all environment variables are set

### Prisma Client Errors
- Run `npx prisma generate` locally
- Ensure `postinstall` script in package.json runs `prisma generate`
- Commit `prisma` folder to git

## Supabase Connection String Format

Use the **Connection Pooling** URI from Supabase:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Replace:
- `[PROJECT_REF]` - Your Supabase project reference
- `[PASSWORD]` - Your database password
- `[REGION]` - Your Supabase region (e.g., `us-east-1`)

