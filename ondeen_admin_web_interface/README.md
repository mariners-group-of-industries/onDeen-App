# OnDeen Admin Console

A small, dependency-free operations console for the OnDeen User and Organiser apps.

## Run locally

```bash
npm start
```

Open `http://localhost:8080`. The API defaults to the production Railway backend and can be changed with `ONDEEN_API_URL`.

The requested demo credentials are prefilled: `admin@gmail.com` / `123456`. If that account is not yet provisioned in the backend, the console opens a clearly-labelled preview mode with safe sample data; no write operation is enabled in preview mode.

## Railway

Railway runs `npm start` and serves the static console. Set `ONDEEN_API_URL` to the backend URL when deploying to another environment.
