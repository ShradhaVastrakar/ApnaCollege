# DSA Sheet (MERN)

A structured **Data Structures & Algorithms** practice sheet: chapters → topics → problems, each with YouTube, LeetCode/Codeforces, and article links, **Easy / Medium / Tough** tags, and **per-user checkbox progress** stored in MongoDB.

## Stack

- **MongoDB** + **Mongoose**
- **Express** (REST API, JWT auth)
- **React** (Vite) + **React Router**

## Local setup

1. **MongoDB**  
   Install locally or use [MongoDB Atlas](https://www.mongodb.com/atlas) and copy your connection string.

2. **Backend**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env: MONGODB_URI, JWT_SECRET (long random string)
   npm install
   npm run seed
   npm run dev
   ```

   API defaults to `http://localhost:5000`.

3. **Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:5173`. The Vite dev server proxies `/api` to port 5000.

4. **Register** a student account, then use the sheet and check problems; progress persists after logout/login.

## Production build (single server)

Useful for a simple **AWS EC2** (or Elastic Beanstalk) deploy:

```bash
cd frontend && npm run build
cd ../backend
NODE_ENV=production MONGODB_URI=... JWT_SECRET=... CLIENT_ORIGIN=https://your-domain.com npm start
```

With `NODE_ENV=production` and `frontend/dist` present, Express serves the React app and the API on one port. Build the frontend with **no** `VITE_API_URL` (or empty) so requests use relative `/api/...` on the same host.

## AWS (deliverable)

Typical options:

- **MongoDB Atlas** for the database (recommended) — whitelist your AWS instance IP or use VPC peering for production.
- **EC2** + **Node** (`npm start` or **PM2**), security group open on 80/443; put **Nginx** in front for TLS and reverse proxy to Node.
- Alternatively **Elastic Beanstalk** for the Node app, or **Amplify** / **S3+CloudFront** for the frontend with the API on **Lambda/API Gateway** or **EC2** (then set `VITE_API_URL` to your API URL at build time).

Replace `CLIENT_ORIGIN` with your real frontend URL for CORS if the UI and API are on different origins.

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | Bearer JWT |
| GET | `/api/problems/` | — (public sheet) |
| GET | `/api/progress/` | Bearer JWT |
| PUT | `/api/progress/:problemId` | Bearer JWT, body `{ "completed": true/false }` |

## Assignment deliverables checklist

- Source code: this repo (`backend/` + `frontend/`).
- **Live AWS link**: deploy using the steps above; add your URL to your submission.
- **2–3 minute video**: screen recording with voice — walk through development choices and demo login + progress persistence.
