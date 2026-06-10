# ☁️ Cloudinary SaaS

A full-stack media management SaaS application built with **Next.js**, **Cloudinary**, **Prisma**, and **NeonDB**. Upload, manage, and transform your images and videos with a clean, modern UI.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | NeonDB (PostgreSQL) via Prisma |
| Media | Cloudinary + next-cloudinary |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## ✨ Features

- 🔐 Authentication via Clerk (sign up, sign in, protected routes)
- 📤 Upload images and videos directly to Cloudinary
- 🖼️ View and manage your uploaded media
- 🗃️ Persistent media metadata stored in NeonDB via Prisma
- 📁 File size display using `filesize`
- 📅 Date formatting using `dayjs`
- 💅 Dark-mode-ready UI with DaisyUI and Tailwind CSS

---

## 📁 Project Structure

```
cloudinary-saas/
├── app/             # Next.js App Router pages & API routes
├── components/      # Reusable UI components
├── lib/             # Utility functions & Cloudinary/Prisma clients
├── prisma/          # Prisma schema and migrations
├── public/          # Static assets
├── types/           # TypeScript type definitions
├── env.sample       # Environment variable template
└── vercel.json      # Vercel deployment config
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- A [Cloudinary](https://cloudinary.com/) account
- A [NeonDB](https://neon.tech/) PostgreSQL database
- A [Clerk](https://clerk.com/) account

### 1. Clone the repository

```bash
git clone https://github.com/ayushhhsingh/cloudinary-SAAS.git
cd cloudinary-SAAS
git checkout setting_up
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the sample env file and fill in your credentials:

```bash
cp env.sample .env.local
```

```env
# .env.local

DATABASE_URL=                          # Your NeonDB connection string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=     # Your Cloudinary cloud name
CLOUDINARY_API_KEY=                    # Your Cloudinary API key
CLOUDINARY_API_SECRET=                 # Your Cloudinary API secret

# Clerk (add from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
npm start
```

> The build step automatically runs `prisma generate` before compiling Next.js.

---

## 🚢 Deployment

This project is deployed on **[Render](https://render.com/)**.

1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following build & start commands:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Add all environment variables from `.env.local` in the Render dashboard under **Environment**.
6. Deploy.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an [issue](https://github.com/ayushhhsingh/cloudinary-SAAS/issues) or submit a pull request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Built with ❤️ by [Ayush Singh](https://github.com/ayushhhsingh)
