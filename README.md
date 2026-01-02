# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)


## Supabase (Auth + Database) setup

This app is configured to use Supabase:

- Project ID: `gpplrmlhqhsfdnbjggns`
- URL: `https://gpplrmlhqhsfdnbjggns.supabase.co`

### Enable sign-in methods (required)

In the Supabase dashboard for this project, go to **Authentication → Providers** and enable/configure the providers you want to show in the app:

- **Google** (requires Google OAuth client ID + secret and redirect URL)
- **Phone (OTP/SMS)** (requires an SMS provider such as Twilio)
- **Email** (for Magic Link; configure SMTP for reliable delivery)

If a provider is not enabled, the app will show an error like **"Unsupported provider: provider is not enabled"** when the user taps it.

Dashboard link:
`https://supabase.com/dashboard/project/gpplrmlhqhsfdnbjggns/auth/providers`

### Redirect URL for Google OAuth

When creating the Google OAuth client, add this Supabase callback URL as an authorized redirect:

`https://gpplrmlhqhsfdnbjggns.supabase.co/auth/v1/callback`

## Android (AAB) build overview (Capacitor)

This repo contains a Capacitor web app. To build for Android you typically:

1. Build the web assets:
   - `npm install`
   - `npm run build`
2. Sync assets to Android:
   - `npx cap sync android`
3. Open Android Studio on the generated `android/` folder.
4. Build → **Generate Signed Bundle / APK** → **Android App Bundle (AAB)** and select your keystore.

> Note: the `android/` folder may not be checked into this repo. If it isn't present, run `npx cap add android` once (on your machine) to generate it, then `npx cap sync android`.
