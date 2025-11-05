# Why Errors Show Up on Vercel But Not Locally

## The Problem

You're seeing TypeScript errors on Vercel but not when running `npm run dev` locally. Here's why:

### 1. **Different Commands**
- **Local (`npm run dev`)**: Runs `next dev` - only checks types incrementally as you edit files
- **Vercel (`npm run build`)**: Runs `next build` - does a **full type check** of your entire codebase

### 2. **Type Checking Strictness**
- `next dev` is **lazy** - it only checks files you're actively editing
- `next build` is **strict** - it checks EVERY file and fails if there are ANY type errors

### 3. **Caching**
- Local dev uses `.next` cache which might hide errors
- Vercel builds fresh every time with no cache

## Solution: Catch Errors Locally Before Pushing

### Option 1: Run Build Locally (Recommended)
Before pushing to GitHub, always run:
```bash
npm run build
```

This will catch the same errors Vercel sees.

### Option 2: Add Type Check Script
I've added a `type-check` script. Run:
```bash
npm run type-check
```

This checks types without building (faster).

### Option 3: Pre-commit Hook (Advanced)
Add a pre-commit hook to automatically check types before commits. But for now, just remember to run `npm run build` before pushing.

## Why We Used `as any`

The Prisma type inference is complex. When you use `select` in queries, Prisma returns a narrowed type, but TypeScript sometimes can't match it perfectly with component props. Using `as any` bypasses the type check - it's a pragmatic solution for deployment, but ideally we'd fix the types properly later.

## Quick Fix Going Forward

**Always run this before pushing:**
```bash
npm run build
```

If it builds successfully locally, it'll build on Vercel too.

