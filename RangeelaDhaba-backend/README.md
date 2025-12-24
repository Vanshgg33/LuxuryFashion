# RangeelaDhaba Backend (NestJS)

NestJS + MongoDB API powering the RangeelaDhaba restaurant experience.

## Features
- JWT auth with refresh tokens
- Google OAuth2 login hook
- Nodemailer for welcome + password reset OTP
- Dishes, orders, banners, restaurant settings, cart
- Cloudinary image uploads
- 5km delivery check via Haversine formula

## Quick Start
```bash
cd RangeelaDhaba-backend
pnpm install   # or npm install / yarn
cp env.example .env
npm run start:dev
```

## Env Vars
See `env.example` for all variables. Required: Mongo URI, JWT secrets, email creds, Cloudinary keys, Google OAuth, restaurant lat/lng.

## Useful Scripts
- `npm run start:dev` - watch mode
- `npm run build` - compile to `dist`
- `npm run start:prod` - run compiled app

## API Overview
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `POST /auth/forgot`, `POST /auth/reset`
- `GET /auth/google` (redirect) and callback
- `GET /dishes`, `POST /dishes`, `PATCH /dishes/:id`, `DELETE /dishes/:id`
- `GET /banners`, `POST /banners`
- `GET /settings`, `PATCH /settings`
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart`
- `POST /orders`, `GET /orders/my`, `GET /orders/admin`
- `GET /analytics/summary`

Admin endpoints require `Authorization: Bearer <token>` with role `admin`.


