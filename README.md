# LOOMA

A full stack music streaming app: albums, liked songs, a persistent queue, real time friend activity and chat.

## Features

- **Player**: queue with play next and add to queue, shuffle, repeat (all or one), seek, volume and mute. The session is saved and restored paused on the next visit.
- **Full screen player**: a 3D record stage that follows the pointer, with the vinyl spinning while music plays. Songs can have a short looping **canvas video** that plays behind the player.
- **Album colour**: page headers and the mini player are tinted with the dominant colour of the artwork.
- **Library**: Liked Songs saved to your account, recently played, and every album.
- **Search** across songs, albums, artists and genres, with genre tiles to browse.
- **Artist and genre pages** with popular tracks, discography and one-click play.
- **Smooth playback**: shows when audio is buffering and how much has downloaded, preloads the next track, plays in only one tab at a time, and refreshes a saved queue when the catalog changes.
- **Play counts**: a play counts after 30 seconds of listening (or half of a shorter track). The "Most played" shelf is ranked by these counts.
- **Friend activity and chat**: see who is online and what they are playing. Direct messages arrive in real time, with unread badges.
- **Keyboard shortcuts**: press `?` in the app for the full list. Lock screen and media key controls use the Media Session API.
- **Admin dashboard**: upload songs, cover art and canvas videos to Cloudinary. Song length is read from the audio file automatically.
- **Responsive**: resizable three panel layout on desktop, tab bar and mini player on phones.
- **Accessibility**: respects reduced motion preferences, works with the keyboard, and labels every control.
- **Wake-up splash**: when the backend is deployed on a free Render service that sleeps when idle, the app waits for a real response from the API before showing anything, with an animated splash and a live elapsed timer. A warm server answers inside a fraction of a second and nobody ever sees it.

## Tech stack

- **Frontend**: React 19, React Router 7, Zustand, Tailwind CSS, Radix UI, Vite
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Services**: MongoDB, Clerk (authentication), Cloudinary (media storage)

## Getting started

Requirements: Node.js 18.18 or newer, and MongoDB running locally or in Atlas.

1. Install dependencies:

   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`, then fill in the values.

3. Load the demo catalog. This replaces all songs and albums; users and messages are kept.

   ```bash
   npm run seed --prefix backend
   ```

4. Start both servers in separate terminals:

   ```bash
   npm run dev --prefix backend    # http://localhost:5000
   npm run dev --prefix frontend   # http://localhost:3000
   ```

To open the admin dashboard at `/admin`, sign in with the address set in `ADMIN_EMAIL`. That address must be verified in Clerk.

## Environment variables

| File | Variable | Purpose |
| --- | --- | --- |
| backend | `MONGODB_URI` | MongoDB connection string |
| backend | `CLIENT_URL` | Allowed browser origins, comma separated (your custom domain in production) |
| backend | `ADMIN_EMAIL` | Account allowed to manage the catalog |
| backend | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk keys |
| backend | `CLOUDINARY_*` | Cloudinary credentials for uploads |
| frontend | `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| frontend | `VITE_API_URL` | Base URL of the deployed backend (only needed when the frontend and backend are on different domains, e.g. Vercel + Render) |
| frontend | `VITE_SITE_URL` | Public URL of the site |
| frontend | `VITE_CONTACT_EMAIL` | Contact address shown on the Privacy Policy and Terms pages |

## Production

The backend and frontend can be deployed together or, as in the setup below, as two separate services (Render for the API, Vercel for the static frontend).

### Single process

```bash
npm run build      # installs both apps and builds the frontend
npm start          # serves the API and the built frontend from one process
```

Set `NODE_ENV=production` so the backend serves `frontend/dist`. Leave `VITE_API_URL` unset in this case, since the frontend calls the API on the same origin.

### Backend on Render, frontend on Vercel

This is the split that the wake-up splash is built for: Render's free web services sleep after a period of inactivity, so requests to a sleeping backend can take up to about a minute to get a response while it restarts.

**Backend (Render)**

1. Create a MongoDB Atlas cluster (Render cannot reach a database on your own machine) and get its connection string.
2. On Render, create a new Web Service from this repository with **Root Directory** set to `backend`, build command `npm install`, start command `npm start`.
3. Add the environment variables from `backend/.env.example`, with `NODE_ENV=production`, `MONGODB_URI` set to the Atlas connection string, and `CLIENT_URL` left blank for now (filled in after the frontend is deployed).
4. Deploy, then run the seed script once against this database (from your machine, with `MONGODB_URI` pointed at Atlas): `npm run seed --prefix backend`.

**Frontend (Vercel)**

1. Import this repository into Vercel with **Root Directory** set to `frontend` (framework preset: Vite).
2. Add the environment variables from `frontend/.env.example`, with `VITE_API_URL` set to the Render service's URL (e.g. `https://looma-api.onrender.com`, no trailing slash).
3. Deploy, then copy the resulting Vercel URL (or your custom domain) into the backend's `CLIENT_URL` on Render and redeploy the backend so CORS allows it.

### Launch checklist

- [ ] Connect a custom domain and set `CLIENT_URL` (backend) and `VITE_SITE_URL` (frontend) to it
- [ ] Create a Clerk production instance for that domain, swap in its `pk_live_` and `sk_live_` keys, and set the application name to LOOMA
- [ ] Set `VITE_CONTACT_EMAIL` and have the Privacy Policy and Terms reviewed for your jurisdiction
- [ ] Replace the demo catalog with music you have the rights to stream
- [ ] Use a managed MongoDB (for example Atlas) and restrict network access
- [ ] If the backend is on a paid Render plan (or elsewhere, that doesn't sleep), the wake-up splash simply never triggers — nothing to turn off

## Demo catalog

`npm run seed --prefix backend` loads 9 albums (69 songs) released under Creative Commons licences by Broke For Free, Josh Woodward, Kai Engel, Kevin MacLeod, Monplaisir and Loyalty Freak Music, sourced from the Internet Archive. Every album page credits the artist, the licence (CC BY or CC0) and the source, as the licences require. The full list is in `backend/src/seeds/catalog.js`.

The seed copies the audio and covers into your Cloudinary account (folder `encore-catalog`, about 300 MB) so they stream from a CDN. Re-running it reuses files that are already uploaded. To skip Cloudinary and stream straight from the Internet Archive (noticeably slower to start and seek), run:

```bash
npm run seed --prefix backend -- --no-upload
```
