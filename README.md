# AI-Coach Project (Deployed on Vercel)

## 📦 Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/mubashirsidiki/ai-coach.git
cd ai-coach
````

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
GEMINI_API_KEY=

# Supabase Configuration
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NODE_ENV=production
```

➡️ For the latest environment variable values, visit:
[Google Sheet – Environment Variables](https://docs.google.com/spreadsheets/d/10w5EQ52yH5jLEtKI3nJlxiKlwBaxrBGY7X6TL7ga-IA/edit?usp=sharing)

### 2. Installation

Make sure you have **Node.js 18 or later** installed, then run:

```bash
npm install
```

### 3. Database Setup

Initialize your database with Prisma:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db push    
```

### 4. Development Server

Run the development server with:

```bash
npm run dev
```

### 5. Production

Build and start for production:

```bash
npm run build
npm run start
```

## 🧱 Tech Stack

* [Next.js 15](https://nextjs.org/) with Turbopack
* [Neon DB](https://neon.tech/) for PostgreSQL
* [Tailwind CSS](https://tailwindcss.com/) for styling
* [Prisma](https://www.prisma.io/) as ORM
* [Inngest](https://www.inngest.com/) for background jobs
* [Shadcn UI](https://ui.shadcn.com/) for components
* [Clerk](https://clerk.com/) for authentication

```