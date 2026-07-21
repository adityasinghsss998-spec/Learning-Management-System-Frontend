<div align="center">

<img src="https://img.shields.io/badge/Status-Live%20%26%20Deployed-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/Architecture-Microservices-4f46e5?style=for-the-badge" />
<img src="https://img.shields.io/badge/Services-7%20Independent-0d9488?style=for-the-badge" />

# Nexus — Full Stack Learning Management System

**A production-grade LMS built from scratch on a polyrepo microservices architecture.**  
Seven independent services. Real-time doubt sessions. AI-powered features. AWS S3 media pipeline. Razorpay payments.

[**Live Demo →**](https://learning-management-system-frontend-i277ad506.vercel.app) &nbsp;·&nbsp; [**Backend API**](https://nexus-api.onrender.com/health) &nbsp;·&nbsp; [**Frontend Repo**](https://github.com/yourusername/nexus-frontend)

</div>

---

> 🚧 **Actively maintained** — AI features, certificate generation, and deployment completed. Next: advanced RAG pipeline and vector search.

---

## What is Nexus?

Nexus is a full-stack Learning Management System where **instructors** create and publish courses with structured sections and video/PDF lessons uploaded directly to AWS S3, and **students** discover, enroll, track progress, join live doubt sessions, and earn real PDF certificates — all through a single API gateway entry point.

Built to mirror how real production systems are architected at scale — not a tutorial clone, but a ground-up engineering project with deliberate architectural decisions at every layer.

---

## Architecture

```
Client (React + Vite)
        │
        ▼
┌─────────────────────────┐
│      API Gateway        │  ← Port 3000 — single entry point
│  JWT Auth · Rate Limit  │  ← Centralized auth, request routing
│  CORS · Proxy           │
└──────────┬──────────────┘
           │
    ┌──────┼──────────────────────────────────┐
    │      │                                  │
    ▼      ▼                                  ▼
auth    user-service              course-service
service    (3002)                     (3003)
(3001)   MongoDB                   MongoDB + S3
MongoDB
                    │
           ┌────────┴─────────┐
           │                  │
           ▼                  ▼
  enrollment-service      ai-service
      (3004)                (3007)
   MongoDB + Razorpay      Gemini API
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
RabbitMQ    course-service
(async)     (Axios HTTP)
    │
    ▼
notification-service
  pdfkit + S3 + SMTP

live-service (3006)
Socket.io + Redis Pub/Sub
```

---

## Services

| Service | Port | Database | Responsibility |
|---|---|---|---|
| `api-gateway` | 3000 | — | JWT verification, reverse proxy, rate limiting |
| `auth-service` | 3001 | MongoDB | Register, login, access + refresh token lifecycle |
| `user-service` | 3002 | MongoDB | Profiles, avatar upload to S3 |
| `course-service` | 3003 | MongoDB + S3 | Course CRUD, sections, lessons, S3 media upload |
| `enrollment-service` | 3004 | MongoDB | Enrollment, Razorpay payments, progress tracking |
| `notification-service` | 3005 | — | RabbitMQ consumer, email, PDF certificate generation |
| `live-service` | 3006 | Redis | Socket.io doubt sessions, Redis presence tracking |
| `ai-service` | 3007 | — | Gemini AI — course descriptions, summaries, suggestions |

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server for each microservice |
| MongoDB + Mongoose | Primary database — schema validation, document methods |
| Redis + ioredis | Real-time pub/sub and presence tracking |
| RabbitMQ + amqplib | Async event-driven communication between services |
| Socket.io | Real-time bidirectional WebSocket communication |
| Axios | Synchronous HTTP between services |
| JWT (jsonwebtoken) | Stateless auth — access (15min) + refresh (7d) token pair |
| bcrypt | Password hashing |
| AWS S3 + @aws-sdk/client-s3 | Cloud storage for videos, PDFs, avatars, certificates |
| multer + multer-s3 | Multipart file upload streamed directly to S3 |
| Razorpay | Payment processing with HMAC-SHA256 signature verification |
| pdfkit | Real PDF certificate generation |
| nodemailer | Transactional email via SMTP |
| @google/generative-ai | Gemini 1.5 Flash AI integration |
| express-rate-limit | Tiered rate limiting at the gateway layer |

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations — hero canvas, staggered cards |
| Axios + interceptors | HTTP client with JWT auto-attach and silent token refresh |
| React Query | Server state — caching, background refetch, optimistic updates |
| React Router | Client-side routing with protected and role-based routes |
| Socket.io-client | Real-time connection to live-service |
| Razorpay JS SDK | Payment modal, loaded on-demand |

---

## Communication Patterns

Three deliberate communication patterns, each chosen for a specific reason:

### Synchronous HTTP (Axios)
Used when a service needs an immediate response before continuing.

```
enrollment-service ──► GET /courses/:id ──► course-service
                    ◄── course data ─────────────────────
(validates course exists, initializes progress array)
```

### Asynchronous Messaging (RabbitMQ)
Used for background tasks that should not block the user.

```
enrollment-service ──► enrollment.created ──► notification-service (welcome email)
enrollment-service ──► certificate.generate ──► notification-service (PDF + email)
```

Dead Letter Queues (DLQ) ensure failed messages are never silently lost.

### Real-Time Bidirectional (Socket.io + Redis)
Used for live features where both sides push data.

```
student ◄──► live-service ◄──► Redis Pub/Sub ◄──► live-service instance 2
(join room, send message, receive message, presence tracking)
```

Redis Pub/Sub enables horizontal scaling — multiple `live-service` instances stay in sync.

---

## Key Features

### For Students
- Browse searchable course catalog (full-text search, category + level + price filters)
- Enroll in free courses instantly or pay via Razorpay for paid courses
- Watch video lessons or read PDF content directly in the browser
- Track lesson-by-lesson progress with auto-calculated completion percentage
- Join live doubt sessions with real-time chat and presence indicators
- Receive auto-generated PDF certificate on course completion
- AI-powered personalized course suggestions on the dashboard

### For Instructors
- Create courses with two-level content hierarchy (Sections → Lessons)
- Upload video/PDF lesson content directly to AWS S3 via multipart streaming
- AI-generated course descriptions from title + topics (Gemini)
- Publish/unpublish courses — draft until ready
- Per-lesson upload progress bar with real S3 streaming

### Platform
- Centralized JWT verification at the gateway — downstream services never see raw tokens
- Refresh token rotation — silent re-authentication without user interruption
- Tiered rate limiting — global + stricter limits on auth endpoints
- Role-based access control — student vs instructor routes enforced at both gateway and service layers
- Dead Letter Queues — failed background jobs are never silently lost
- Real PDF certificate generation with pdfkit, uploaded to S3, emailed to student

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- RabbitMQ (local — dashboard at `http://localhost:15672`)
- Redis (local)
- AWS S3 bucket with credentials
- Razorpay test account
- Google AI Studio API key (for ai-service)
- Gmail account with App Password (for notification-service)

### Clone and Install

```bash
git clone https://github.com/yourusername/nexus-lms.git
cd nexus-lms

# Install dependencies for each service
for service in api-gateway auth-service user-service course-service enrollment-service notification-service live-service ai-service; do
  cd $service && npm install && cd ..
done

# Install frontend
cd nexus-frontend && npm install
```

### Environment Variables

Each service has its own `.env` file. Key variables:

```env
# api-gateway
PORT=3000
ACCESS_SECRET=your_jwt_access_secret
AUTH_SERVICE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3002
COURSE_SERVICE_URL=http://localhost:3003
ENROLLMENT_SERVICE_URL=http://localhost:3004
LIVE_SERVICE_URL=http://localhost:3006
AI_SERVICE_URL=http://localhost:3007
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# auth-service
PORT=3001
MONGO_URI=mongodb://localhost:27017/lms_auth
ACCESS_SECRET=your_jwt_access_secret
REFRESH_SECRET=your_jwt_refresh_secret

# course-service
PORT=3003
MONGO_URI=mongodb://localhost:27017/lms_courses
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket_name

# enrollment-service
PORT=3004
MONGO_URI=mongodb://localhost:27017/lms_enrollments
COURSE_SERVICE_URL=http://localhost:3003
RABBITMQ_URL=amqp://localhost
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret

# notification-service
RABBITMQ_URL=amqp://localhost
ENROLLMENT_SERVICE_URL=http://localhost:3004
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
S3_BUCKET=your_bucket_name
CLIENT_URL=http://localhost:5173

# live-service
PORT=3006
REDIS_URL=redis://localhost:6379

# ai-service
PORT=3007
GEMINI_API_KEY=your_gemini_api_key

# nexus-frontend
VITE_API_URL=http://localhost:3000/api/v1
```

### Run All Services

Open a separate terminal for each:

```bash
cd api-gateway && npm run dev          # Terminal 1
cd auth-service && npm run dev         # Terminal 2
cd user-service && npm run dev         # Terminal 3
cd course-service && npm run dev       # Terminal 4
cd enrollment-service && npm run dev   # Terminal 5
cd notification-service && npm run dev # Terminal 6
cd live-service && npm run dev         # Terminal 7
cd ai-service && npm run dev           # Terminal 8
cd nexus-frontend && npm run dev       # Terminal 9
```

Frontend: `http://localhost:5173`  
API Gateway: `http://localhost:3000`  
RabbitMQ Dashboard: `http://localhost:15672`

---

## API Reference

All requests go through `http://localhost:3000`. Protected routes require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | No | Register student or instructor |
| POST | `/api/v1/auth/login` | No | Login, receive access + refresh tokens |
| POST | `/api/v1/auth/refresh` | No | Silently refresh access token |
| POST | `/api/v1/auth/logout` | No | Invalidate refresh token |

### Courses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/courses` | Optional | Browse catalog with search and filters |
| GET | `/api/v1/courses/my` | Yes | Instructor's own courses |
| GET | `/api/v1/courses/:id` | Optional | Full course with sections and lessons |
| POST | `/api/v1/courses` | Yes (instructor) | Create a new course |
| PATCH | `/api/v1/courses/:id/publish` | Yes (instructor) | Toggle publish/unpublish |
| POST | `/api/v1/courses/:id/sections` | Yes (instructor) | Add a section |
| POST | `/api/v1/courses/:courseId/sections/:sectionId/lessons` | Yes (instructor) | Upload a lesson to S3 |

### Enrollments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/enrollments/checkout` | Yes | Create Razorpay order for paid course |
| POST | `/api/v1/enrollments/verify-payment` | Yes | Verify payment signature and enroll |
| POST | `/api/v1/enrollments/free` | Yes | Enroll in free course |
| GET | `/api/v1/enrollments/my` | Yes | Get all student enrollments |
| PATCH | `/api/v1/enrollments/progress` | Yes | Mark a lesson complete |

### AI
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/ai/describe` | Yes | Generate course description from title |
| POST | `/api/v1/ai/summarize` | Yes | Summarize lesson content |
| POST | `/api/v1/ai/suggest` | Yes | Personalized course suggestions |

---

## Deployment

| Service | Platform |
|---|---|
| 8 backend services | Render (Web Services) |
| MongoDB | MongoDB Atlas (M0 free tier) |
| Redis | Redis Cloud (free tier) |
| RabbitMQ | CloudAMQP (Little Lemur free tier) |
| Frontend | Vercel |
| Media storage | AWS S3 |

---

## Project Status

| Component | Status |
|---|---|
| `api-gateway` | ✅ Deployed |
| `auth-service` | ✅ Deployed |
| `user-service` | ✅ Deployed |
| `course-service` | ✅ Deployed |
| `enrollment-service` | ✅ Deployed |
| `notification-service` | ✅ Deployed |
| `live-service` | ✅ Deployed |
| `ai-service` | ✅ Deployed |
| React frontend | ✅ Deployed |
| PDF certificate generation | ✅ Complete |
| Razorpay payments | ✅ Complete |
| Gemini AI integration | ✅ Complete |

### Planned
- [ ] Vector database (Pinecone) for semantic course search
- [ ] RAG pipeline — AI answers questions using course content as context
- [ ] Jest integration tests across all services
- [ ] Docker Compose for single-command local setup
- [ ] CI/CD pipeline with GitHub Actions

---

## Author

**Aditya Kumar**  
B.Tech CSE — IIIT Ranchi (2028) · CGPA 9.09  
Competitive Programming Coordinator — mentoring 50+ students in DSA  
ATF 2025 National Finalist — Top 0.1% of 250,000+ applicants  
CodeChef 3★ (max 1621) · Codeforces Specialist · 500+ problems solved

[![GitHub](https://img.shields.io/badge/GitHub-yourusername-181717?style=flat&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adityakumar-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/yourprofile)

---

<div align="center">
<sub>Built piece by piece, one microservice at a time. Every architectural decision has a reason.</sub>
</div>
