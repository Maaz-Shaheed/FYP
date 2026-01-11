# AI Career Coach

An AI-powered career coaching application built with Next.js 15, featuring resume building, interview preparation, and career guidance.

## 📦 Clone the Repository

```bash
git clone https://github.com/Maaz-Shaheed/FYP.git
cd FYP
```

## 🛠️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# OpenAI AI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-nano
OPENAI_REALTIME_MODEL=gpt-realtime-mini
OPENAI_REALTIME_VOICE=cedar
INTERVIEW_TIME_LIMIT_SECONDS=120

# Supabase Database
POSTGRES_PRISMA_URL=postgresql://postgres.project-ref:password@aws-region.pooler.supabase.com:5432/postgres
POSTGRES_URL_NON_POOLING=postgresql://postgres.project-ref:password@aws-region.pooler.supabase.com:5432/postgres?sslmode=require

# Supabase API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Environment
NODE_ENV=development
```

**Get your credentials:**
- **Clerk:** [Clerk Dashboard](https://dashboard.clerk.com/)
- **Supabase:** [Supabase Dashboard](https://supabase.com/dashboard) → Settings → Database
- **OpenAI:** [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. Installation

Make sure you have **Node.js 18 or later** installed, then run:

```bash
npm install
```

### 3. Database Setup

Push the Prisma schema to your database:

```bash
npx prisma db push
```

### 4. Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production

Build and start for production:

```bash
npm run build
npm run start
```

## 🧱 Tech Stack

| Technology | Description |
|------------|-------------|
| [Next.js 15](https://nextjs.org/) | React framework with Turbopack |
| [Supabase](https://supabase.com/) | PostgreSQL database hosting |
| [Prisma](https://www.prisma.io/) | ORM for database operations |
| [Clerk](https://clerk.com/) | Authentication |
| [OpenAI](https://platform.openai.com/) | AI API for coaching |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Shadcn UI](https://ui.shadcn.com/) | UI components |

## 📝 Features

- User authentication with Clerk
- AI-powered career coaching
- Resume builder with ATS scoring
- Cover letter generator
- Interview preparation assessments
- Industry insights and salary data

## 📄 License

See [LICENSE](LICENSE) file for details.
