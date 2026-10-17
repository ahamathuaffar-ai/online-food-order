# MooNLight Food

A responsive food-ordering frontend built with React. Browse the menu by category, add food to a cart, place delivery orders, review order history, update a customer profile, and use the restaurant dashboard to manage menu items, categories, and order status. Checkout offers cash on delivery, UPI, and card as recorded payment preferences; UPI and card are not processed online. The restaurant contact number is 8489671595.

## Run locally

Start the backend first from `online-food-order-backend`:

```sh
npm start
```

Configure that folder's `.env` with `MONGODB_URI` (your MongoDB Atlas connection string) and `JWT_SECRET`. The API listens on port `5000` by default; set `PORT` to override it. Keep `.env` private and do not commit it.

Then, from this folder (`my-app`), run:

```sh
npm start
```

Open [http://localhost:3000](http://localhost:3000). Create a production build with `npm run build`, or run the checks with `npm test -- --watchAll=false --runInBand`.

The React development server proxies `/api` requests to `http://localhost:5000`. For a separately hosted API, set `REACT_APP_API_URL` to its API base URL (for example, `https://api.example.com/api`) before building. The menu and categories are stored in MongoDB, so a new database starts empty; register a customer account in the app, provision a restaurant administrator account in the database, then use the admin dashboard to add categories and food items.

The 12 starter food photos are stored locally in `src/images`, bundled with the app, and available offline. Google Fonts load from Google Fonts when an internet connection is available.

## Deploy the frontend to Vercel

This repository keeps the Create React App frontend and Express/MongoDB backend in separate folders. Configure the Vercel frontend project as follows:

| Setting | Value |
| --- | --- |
| Root Directory | The folder containing the frontend `package.json` (`my-app` in this workspace; `.` if the frontend repository itself is selected) |
| Framework Preset | Create React App |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Node.js Version | `24.x` (the version used for local verification) |

Set `REACT_APP_API_URL` in the Vercel project's environment variables to the public HTTPS API base URL, including `/api` (for example, `https://api.example.com/api`). This is embedded at build time, so rebuild/redeploy after changing it. Deploy the Express backend separately, configure its `MONGODB_URI` and `JWT_SECRET` in that host's environment, and ensure the API allows requests from the Vercel site's origin. Check the backend's `/api/health` endpoint after deployment.

The frontend `vercel.json` rewrites non-file routes to the CRA entry page, and the app maps routes such as `/menu`, `/cart`, and `/orders` to their corresponding screens. This supports direct visits and refreshes on those paths. Do not set `REACT_APP_API_URL` to a secret: it is public client-side configuration and must contain only the backend's public API URL.

The backend has a separate `package-lock.json` and `vercel.json`; if deploying that project to Vercel, set `online-food-order-backend` as its root directory so Vercel uses the backend's explicit API entry point (`server/server.js`) rather than the legacy `app.js`. Configure `MONGODB_URI` and `JWT_SECRET` in the backend Vercel project's environment variables. The API entry point exports the Express app for Vercel and starts its listener only for local `npm start`. Its legacy Jade renderer has been migrated to Pug to remove Jade's obsolete `transformers`/`uglify-js` dependency chain while retaining the existing rendered pages.
