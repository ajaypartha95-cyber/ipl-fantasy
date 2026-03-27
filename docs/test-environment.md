# Test Environment Setup

This document describes the non-production setup for testing Silly Point safely without affecting the live app.

## Branch strategy

- `main` → production-safe branch
- `test` → testing branch for auth, DB, and feature experiments

## Database strategy

- Production app uses the **production Supabase project**
- Local testing on the `test` branch uses the **test Supabase project**

## Local environment

Local development on the `test` branch should use:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL=https://ullyugcyztkxyeaithjf.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbHl1Z2N5enRreHllYWl0aGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjYxOTEsImV4cCI6MjA5MDIwMjE5MX0.TOIZQd2HNA6hKV_w9v-GKy14DW8Bv0WH7B5vuTSGpMU`

These values are stored in `.env.local`, which is intentionally not committed.

## Google OAuth strategy

A separate Google OAuth client is used for the **test Supabase project**.

### Test OAuth setup

Authorized JavaScript origins:
- `http://localhost:3000`

Authorized redirect URIs:
- `https://ullyugcyztkxyeaithjf.supabase.co/auth/v1/callback`

### Test users
At minimum:
- `ajaypartha95@gmail.com`

Other approved users can be added if needed for local testing.

## Supabase test project settings

In the **test Supabase project**:

### Authentication → URL Configuration

Site URL:
- `http://localhost:3000`

Redirect URLs:
- `http://localhost:3000/**`

### Authentication → Providers → Google

- Google provider enabled
- Uses the **test OAuth client ID and secret**

## Approved user mapping

The app currently supports only these approved emails:

- `ajaypartha95@gmail.com`
- `vigneshsuse@gmail.com`
- `nahdnivara@gmail.com`
- `adarbhde96@gmail.com`
- `kishansrevatsan@gmail.com`

These are mapped in the `profiles.email` column.

## Current note

The `test` branch may temporarily diverge from `main` while features are validated.
No experimental DB/auth work should be done directly against production.