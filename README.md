![Next.js](https://img.shields.io/badge/Built%20With-Next.js-blue?logo=next.js)
![Supabase](https://img.shields.io/badge/Database-Supabase-green?logo=supabase)
![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-orange?logo=openai)


# 🚀 LaunchBox.AI - The Next-Gen AI DevOps Playground

> **Note:** This project is built using [Bolt.new](https://bolt.new) AI tools for the Bolt.new Hackathon.

---

## 🌟 Overview

**LaunchBox.AI** is a cutting-edge, AI-powered platform for developers and teams to build, test, and simulate applications with seamless DevOps automation. Instantly generate Dockerfiles, Jenkinsfiles, and step-by-step deployment guides tailored to your codebase. Experience a modern, collaborative, and secure development environment - powered by the latest AI models.

---

## 🚀 Demo Video
[![Watch the demo](https://img.shields.io/badge/Watch%20Demo%20Video-%23FF0000?logo=youtube&logoColor=white)](https://youtu.be/Tj690TNMELI)

## ✨ Key Features

- **AI-Powered DevOps Automation**
  - Instantly generate Dockerfiles, Jenkinsfiles, and detailed DevOps guides for any project
  - Advanced code analysis and smart code commenting
- **Multi-File Smart Editor**
  - Monaco-based editor with syntax highlighting, multi-file support, and context-aware suggestions
- **Project Management Dashboard**
  - Organize, search, and manage all your projects in one place
- **Real-Time Collaboration** *(coming soon)*
  - Work with your team in a live, shared workspace
- **Secure Authentication & Data**
  - Supabase Auth, Row Level Security, and robust session management
- **Modern UI/UX**
  - Beautiful, responsive design with dark mode, animations, and accessibility in mind
- **Performance & Analytics**
  - Built-in performance monitoring and actionable insights

---

## 🖥️ Tech Stack

| Layer         | Technology                                 |
|-------------- |--------------------------------------------|
| Frontend      | Next.js 14, React 18, TypeScript           |
| Styling       | Tailwind CSS, Framer Motion                |
| Database/Auth | Supabase (PostgreSQL, RLS, Auth)           |
| AI Integration| OpenRouter API (Qwen3 30B, Mistral, etc.)  |
| Editor        | Monaco Editor                              |
| UI Components | Radix UI, shadcn/ui                        |

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/suhasbm09/launchbox-ai.git
cd launchbox-ai
npm install
```

### 2. Configure Environment

Copy the example env and add your keys:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. Set Up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Run migrations:
  ```bash
  npx supabase db push
  ```
- Enable Row Level Security (RLS) in your Supabase dashboard

### 4. Start the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Project Structure

```
launchbox-ai/
├── app/           # Next.js app directory (API, dashboard, project workspace)
├── components/    # UI, dashboard, workspace, and landing page sections
├── lib/           # Utilities, API clients, types, security
├── hooks/         # Custom React hooks
├── supabase/      # Database migrations & config
├── public/        # Static assets (fonts, images, manifest)
└── ...
```

---

## 🔒 Security

- **All AI API calls are server-side** (API keys never exposed)
- **Supabase RLS** for strict data access control
- **Input validation & sanitization** everywhere
- **Comprehensive security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **Session management** with CSRF protection
- **Error boundaries** for graceful error handling
- **.env & secrets** are always gitignored

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub ([suhasbm09/launchbox-ai](https://github.com/suhasbm09/launchbox-ai))
2. Connect to [Vercel](https://vercel.com/)
3. Add environment variables in the Vercel dashboard
4. Deploy!

### Other Supported Platforms
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Any platform supporting Next.js 14

---

## 🆕 Live Demo

<!--
[![Try LaunchBox.AI Live](https://img.shields.io/badge/Try%20Live-LaunchBox.AI-blue?style=for-the-badge)](https://launchbox-ai.vercel.app)
-->

*Coming soon: Try out LaunchBox.AI live!*  
*Stay tuned for a demo video walkthrough!*

---

## 📹 Demo Video

<!--
[![Watch the Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-red?style=for-the-badge)](https://youtube.com/your-demo-link)
-->

*Demo video will be available after the hackathon!*

---

## 💬 Support & Contact

- [GitHub Issues](https://github.com/suhasbm09/launchbox-ai/issues)
- [Discord Community](https://discord.gg/W2EyUVUk)
- Email: suhasbm2004@gmail.com

---

> **Disclaimer:** This project was built using [Bolt.new](https://bolt.new) AI tools as part of the Bolt.new Hackathon. All code, features, and documentation were generated and refined with the help of Bolt.new's AI platform.







