# Roadies Rebirth – Fan Site (MERN)

Unofficial fan site. Built with **M**ongoDB, **E**xpress, **R**eact and **N**ode.

- `client/` – the React website (Vite + React Router)
- `server/` – the Express API + MongoDB (Mongoose). In production it also serves the built React site.
- Pages: Home, Episodes, Contestants, Eliminations, Gangs, Auditions, and a private `/admin` page.

Content (episodes, contestants, etc.) lives in MongoDB. You add it from the `/admin` page, with no code changes or re-uploads.

---

## 1. Run it on your computer

You need **Node.js 18+** and a MongoDB database. The easiest database is a free one on MongoDB Atlas (see step 2). Or install MongoDB locally.

```bash
npm run install:all          # installs server + client packages (also run: npm install   in this root folder once)
cp server/.env.example server/.env
```

Open `server/.env` and set:
- `MONGODB_URI` – your database connection string
- `ADMIN_KEY` – a long secret password (12+ characters). You use it to log in at `/admin`.

Then:

```bash
npm run seed                 # adds the 6 gang leaders (safe to run again, never duplicates)
npm run dev                  # website on http://localhost:5173, API on http://localhost:5000
```

To test the production version: `npm run build && npm start`, then open http://localhost:5000.

---

## 2. Put it on the internet (free)

### A. Free database – MongoDB Atlas
1. Sign up at **mongodb.com/atlas** and create a free **M0** cluster.
2. **Database Access** → add a user with a password.
3. **Network Access** → add IP address `0.0.0.0/0` (allows your host to connect).
4. **Connect → Drivers** → copy the connection string. Replace `<password>` with yours and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/roadies-rebirth`

### B. Free hosting – Render
1. Create a free account at **github.com** and upload this project folder as a new repository. (Do not upload `server/.env`; `.gitignore` already excludes it.)
2. Sign up at **render.com** → **New → Blueprint** → choose your repository. It reads `render.yaml` automatically.
3. When asked, enter these values:
   - `MONGODB_URI` – the Atlas string from above
   - `ADMIN_KEY` – your secret admin password
   - `SITE_URL` – the address Render gives you, like `https://roadies-rebirth.onrender.com` (you can add it after the first deploy, then redeploy)
4. Once live, add the leaders to the live database. Easiest way: in Render open your service → **Shell** → run `npm run seed`.
   (Or run `npm run seed` on your own computer with the Atlas string in `server/.env`.)

Note: on Render's free plan the site "sleeps" after 15 minutes without visitors, so the first visit afterwards takes about 30–60 seconds. A paid plan removes this.

---

## 3. Adding content

Go to `https://your-site/admin`, enter the admin key, choose a section (Episodes, Contestants, Eliminations, Auditions, Gang leaders), and fill in the form. Changes appear on the site immediately.

**Photos:** put image files in `client/public/images/` and use the path `/images/file-name.jpg` in the Photo field (then redeploy), or paste a full `https://` link.

## 4. Getting found on Google

1. After the site is live, go to **search.google.com/search-console**, add your site address, and verify it.
2. Submit your sitemap: `https://your-site/sitemap.xml`
3. Use **URL inspection → Request indexing** on the home page.

Each page already has its own title and description. These are written into the HTML by the server, so Google sees them without running JavaScript. `/admin` and `/api` are hidden from search.

## 5. Adding a new section later

Ask Claude, or: add a model in `server/src/models/index.js`, a form in `client/src/resources.js`, a page in `client/src/pages/`, a route in `client/src/App.jsx`, and its title in both `server/src/seo.js` and `client/src/seoData.js`.

## Security notes
- Anyone can read the content. Only someone with `ADMIN_KEY` can change it. Keep the key private and never commit `.env`.
- Only `https://` links and local `/images/...` paths are accepted for photos and watch links.
- Write requests are rate-limited.
