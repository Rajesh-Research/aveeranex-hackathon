# 🏆 AVEERANEX INNOVATE ONLINE HACKATHON PORTAL (Nov'26 Edition)

An enterprise-grade, secure full-stack web application for the **AVEERANEX INNOVATE ONLINE HACKATHON**.

Designed and built for **AVEERANEX (OPC) PRIVATE LIMITED** under the leadership of **Dr. Rajesh Kumar (Director)**.

---

## 🚀 Key Features

### 1. 📝 Comprehensive Participant Registration & Sign In
- **Complete participant profile capture**:
  - Full Name (rendered dynamically on the official certificate)
  - Team Name
  - E-mail ID & Mobile Contact
  - College / University Name
  - Location (City), State, Country & Pin Code
  - Presentation Topic Title & Topic Domain (AI/ML, Web3, Cloud, IoT, HealthTech, etc.)
  - Presented On: `AVEERANEX INNOVATE ONLINE HACKATHON  Nov'26`
  - Encrypted password credentials with bcrypt hashing

### 2. 🔐 Super Admin Approval Pipeline
- **Dedicated Super Admin Console (`/admin`)**:
  - Live participant statistics (Total Registrations, Pending Approvals, Issued Certificates, Domains)
  - Search, filter, and review presentation records
  - **One-click Certificate Approval**: Issues tamper-proof Certificate ID (`AVX-2026-NOV-XXXX`), cryptographic signature, and activation timestamp
  - **Rejection with Feedback**: Allows returning submissions for revision
  - **Bulk Approval**: Approve batches of qualified presentations simultaneously
  - **CSV Export**: Export all registered participants and topic data for records

### 3. 🎓 Dynamic Certificate Auto-Generation
- **Fixed Official Template**:
  - Exact high-definition template with Aveeranex branding, Director signature, official corporate seal, and watermark
  - Dynamic rendering of Participant Name in custom teal typography (`#067F92`)
  - Team Name and unique Certificate Verification ID
  - Dynamic QR code embedded for instant scan-to-verify
  - **Download Official PDF** (A4 landscape 300 DPI printable)
  - **Download High-Res PNG** image

### 4. 📢 Social Media Integration & Community Tagging
- Direct one-click links and pre-composed tagging captions for official Aveeranex channels:
  - 📸 **Instagram**: [`https://www.instagram.com/aveeranex`](https://www.instagram.com/aveeranex)
  - ▶️ **YouTube**: [`https://www.youtube.com/@aveeranex`](https://www.youtube.com/@aveeranex)
  - 💼 **LinkedIn**: [`https://www.linkedin.com/company/aveeranex`](https://www.linkedin.com/company/aveeranex)
  - 🌐 **AVEERANEX Website**: [`https://www.aveeranex.com`](https://www.aveeranex.com)
  - 🎓 **AVEERANEX LEARN**: [`https://www.aveeranex.com/products/learn`](https://www.aveeranex.com/products/learn)

### 5. 🛡️ Public Certificate Verification Engine (`/verify/[id]`)
- Open verification page accessible to recruiters, universities, and judges
- Real-time cryptographic validation against the Aveeranex registry

---

## 🛠️ Tech Stack & Security

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS with custom Aveeranex futuristic dark theme
- **Security & Cryptography**:
  - Password hashing with `bcryptjs`
  - Stateless secure session tokens with `jsonwebtoken` (JWT)
  - Role-Based Access Control (RBAC) separating Participants and Super Admins
  - Protected API endpoints (`/api/admin/*`, `/api/certificate/*`)
- **Document Generation**: HTML5 Canvas, `jsPDF`, `qrcode`, `canvas-confetti`
- **Hosting**: Ready for Vercel deployment with zero additional configuration

---

## 🔑 Default Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Super Admin** | `info@aveeranex.com` | `aveeranex@123` | Full Admin Approval Portal (`/admin`) |
| **Approved Demo User** | `innovator@aveeranex.com` | `Hackathon@2026` | Certificate Download & Social Sharing (`/dashboard`) |
| **Pending Demo User** | `priya.s@university.edu` | `Hackathon@2026` | Pending Approval State Demo |

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser
http://localhost:3000
```

---

## 🌐 Deploy to Vercel

This repository is optimized for one-click deployment on **Vercel**:

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Aveeranex Hackathon Portal with Super Admin approval and Certificate issuance"
   git branch -M main
   git remote add origin https://github.com/<your-username>/aveeranex-hackathon-portal.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the GitHub repository and click **Deploy**.
4. (Optional) Set environment variable in Vercel:
   - `JWT_SECRET`: Any secure random string

---

© 2026 **AVEERANEX (OPC) PRIVATE LIMITED**. All Rights Reserved.
Director: **Dr. Rajesh Kumar**
Website: [https://www.aveeranex.com](https://www.aveeranex.com)
