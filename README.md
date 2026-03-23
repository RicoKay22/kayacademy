# KayAcademy 🎓

**The learning platform built for the next generation of African professionals.**

From frontend engineering to economics, civil engineering to data science — KayAcademy delivers structured, world-class education across 7 disciplines.

---

## 🔗 Live Demo
[kayacademy.vercel.app](https://kayacademy.vercel.app)

---

## ✨ Features

- 🔐 **Authentication** — Email/password + Google, GitHub, LinkedIn OAuth via Supabase
- 📧 **Email verification** — OTP & magic link on signup, password reset via email
- 🔒 **Protected routes** — Unauthenticated users redirected to login
- 📚 **Course catalog** — 14 courses across 7 disciplines with search & filters
- 🎬 **Lesson player** — Embedded YouTube lessons with sidebar navigation
- ✅ **Progress tracking** — Mark lessons complete, visual progress bars
- 🎓 **Certificates** — Auto-generated, printable/downloadable on course completion
- 📊 **Dashboard** — Continue where you left off, enrollment stats
- 🔑 **Password strength meter** — Live validation with requirements checklist

---

## 🗂 Folder Structure

```
src/
 ├── components/
 │   ├── course/         # CourseCard
 │   ├── layout/         # Navbar
 │   └── ui/             # Badge, ProgressBar, Spinner
 ├── data/               # Mock course data (14 courses, 7 categories)
 ├── hooks/              # useAuth, useProgress  ← custom hooks
 ├── lib/                # Supabase client
 ├── pages/              # All route-level pages
 ├── routes/             # ProtectedRoute
 ├── store/              # AuthContext, AppContext (useReducer)
 └── styles/             # Global CSS + Tailwind
```

---

## ⚙️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Hooks | UI & state |
| React Router v6 | Routing + nested routes |
| Context API + useReducer | State management |
| Supabase | Auth + PostgreSQL database |
| Tailwind CSS | Styling |
| Vite | Build tool |

---

## 🚀 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/kayacademy.git
cd kayacademy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Authentication → Sign In / Providers** and enable desired OAuth providers

### 4. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🎬 Demo Flow

```
Sign Up → Verify Email → Browse Catalog → Enroll in Course
→ Watch Lessons → Mark Complete → Earn Certificate
```

---

## 🗃 Database Schema

| Table | Description |
|-------|-------------|
| `enrollments` | Tracks which users enrolled in which courses |
| `progress` | Tracks completed lessons per user per course |
| `activity` | Records last active timestamp for reminder logic |
| `certificates` | Issued on 100% course completion |

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🌍 Why KayAcademy?

Africa has 1.4 billion people and a growing demand for skilled professionals across every discipline. KayAcademy is built to make high-quality structured learning accessible, trackable, and rewarding — from Lagos to Nairobi to Accra.

---

## 👨‍💻 Built by

**Rico Kay** — Frontend Engineer  
[LinkedIn](https://linkedin.com/in/ricokay) · [GitHub](https://github.com/ricokay) · [Portfolio](https://digital-business-card-beta-opal.vercel.app/)

---

*Built as part of Web3Bridge Frontend Cohort XIV — JavaScript Advanced Track*
