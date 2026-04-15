# BookIt

A simple Next.js booking platform for businesses and customers.

## Live URL

https://bookit.up.railway.app/

## Requirements

- Node.js 20+
- npm

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your environment variables in `.env` (for example: database, auth, and email settings).

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. (Optional) Seed sample data:

```bash
npm run prisma:seed
```

5. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Run the production server
- `npm run lint` - Lint the project
- `npm run prisma:seed` - Seed the database
