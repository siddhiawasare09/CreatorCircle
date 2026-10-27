# CreatorCircle

### Where creators and brands find the right collaboration.

CreatorCircle is a full-stack MERN platform that connects creators with brands. Creators can build a profile, find opportunities, track inquiries, and use AI to draft partnership proposals. Brands can publish campaigns, discover creators, and review proposals, while administrators manage users and community content.

## Features

### For creators

- **AI pitch generator:** Drafts a first-person campaign proposal with the Google Gemini API, based on the creator profile and campaign details.
- **Creator profiles:** Create and update a profile that showcases a creator's niche, skills, and work.
- **Inquiry tracking:** Follow conversations and statuses for brand inquiries.
- **Shortlists:** Save creators for later reference and collaboration planning.
- **Creator discovery:** Browse creator profiles and view suggested matches.

### For brands

- **Campaigns:** Publish and manage campaigns and their collaboration requirements.
- **Proposal management:** Review creator proposals and manage partnership applications.
- **Creator discovery:** Browse and search profiles to find creators suited to a campaign.

### For administrators

- **Analytics overview:** Review platform totals for users, creators, brands, campaigns, and inquiries.
- **User management:** Search accounts and suspend or reactivate users.
- **Content moderation:** Review and remove creator profiles, portfolio posts, and inquiries.

### Settings and accounts

- **Light and dark themes:** Set and save a preferred theme.
- **Notification preferences:** Configure notifications for accepted proposals and new messages.
- **Password security:** Change a password and use the password-reset flow.
- **Role status:** View account role information in settings; it is displayed as account information rather than an editable preference.

## Technology stack

| Category | Technologies |
| --- | --- |
| Frontend | React, Vite, custom CSS, Lucide React icons |
| Frontend styling | Tailwind CSS was requested for this stack description, but it is not currently present in the client dependencies or configuration. The application currently styles its UI with CSS files. |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | MongoDB (including MongoDB Atlas), Mongoose |
| AI integration | Google Gemini API via `@google/genai` |
| Deployment | AWS EC2, PM2, and Nginx are the intended deployment components described here; deployment configuration is not included in this repository. |

Other client dependencies include React Router, Redux Toolkit, Axios, React Hook Form, Framer Motion, Recharts, and Sonner. The server also uses Nodemailer for email, Multer for uploads, and Morgan for request logging.

## Project structure

```text
CreatorCircle/
├── client/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── AIPitchGeneratorModal.jsx
│       │   ├── AdminRoute.jsx
│       │   ├── AiAssistantWidget.jsx
│       │   ├── CreatorCard.jsx
│       │   ├── CreatorProfileForm.jsx
│       │   ├── InquiryThread.jsx
│       │   ├── LoadingSkeletons.jsx
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx
│       │   ├── PostForm.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── ThemeSync.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ShortlistContext.jsx
│       │   ├── authContext.js
│       │   ├── shortlistContext.js
│       │   ├── useAuth.js
│       │   └── useShortlist.js
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   ├── BrandCampaigns.jsx
│       │   ├── Campaigns.jsx
│       │   ├── CreateProfile.jsx
│       │   ├── CreatorDetails.jsx
│       │   ├── CreatorMatch.jsx
│       │   ├── Creators.jsx
│       │   ├── Dashboard.jsx
│       │   ├── EditProfile.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── MyInquiries.jsx
│       │   ├── ProfileSettingsPage.jsx
│       │   ├── Register.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── SettingsPage.jsx
│       │   └── Shortlist.jsx
│       ├── services/
│       │   └── api.js
│       ├── utils/
│       │   └── creatorMatching.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│   └── vite.config.js
├── server/
│   ├── package.json
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiChatController.js
│   │   ├── aiController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── campaignController.js
│   │   ├── creatorController.js
│   │   ├── googleAuthController.js
│   │   ├── inquiryController.js
│   │   ├── postController.js
│   │   ├── proposalController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── adminAuth.js
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── brandMiddleware.js
│   │   ├── creatorMiddleware.js
│   │   └── optionalAuthMiddleware.js
│   ├── models/
│   │   ├── Campaign.js
│   │   ├── Creator.js
│   │   ├── Inquiry.js
│   │   ├── Post.js
│   │   ├── Proposal.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aiChatRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── creatorRoutes.js
│   │   ├── inquiryRoutes.js
│   │   ├── postRoutes.js
│   │   ├── proposalRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── utils/
│   │   └── sendEmail.js
│   ├── .env.example
│   └── server.js
├── .gitignore
├── notes.txt
└── README.md
```

Dependency directories and generated build output are intentionally omitted from the tree.

## Environment variables

Create local environment files in `server/` and `client/`. Do not commit secrets. The variable names below reflect the current source code; note the naming differences from some deployment conventions.

### `server/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000`. |
| `MONGODB_URI` | Yes | MongoDB connection string (for example, a MongoDB Atlas URI). The current server reads `MONGODB_URI`, not `MONGO_URI`. |
| `JWT_SECRET` | Yes | Secret used to sign and verify authentication tokens. |
| `GEMINI_API_KEY` | For AI features | Google Gemini API key for AI proposal and assistant features. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google OAuth client ID used by the server's Google authentication flow. |
| `CLIENT_URL` | For password-reset email links | Public client URL used to construct password reset links. The current mail utility reads `CLIENT_URL`, not `FRONTEND_URL`. |
| `SMTP_HOST` | For sending email | SMTP server hostname. |
| `SMTP_PORT` | For sending email | SMTP server port. |
| `SMTP_USER` | For sending email | SMTP account username. |
| `SMTP_PASS` | For sending email | SMTP account password. |
| `EMAIL_FROM` | For sending email | Sender address displayed on outgoing messages. |

Email settings are optional for local development; when SMTP is not configured, the password-reset link is logged by the development fallback.

### `client/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL, including `/api`; defaults to `http://localhost:5000/api`. The current client reads `VITE_API_URL`, not `VITE_API_BASE_URL`. |

The names `MONGO_URI`, `FRONTEND_URL`, and `VITE_API_BASE_URL` are not currently read by this codebase. Use the corresponding variable names documented above unless the application code is updated to support those aliases.

## Local development

### Prerequisites

- Node.js and npm
- A MongoDB database (local or MongoDB Atlas)
- A Google Gemini API key if you want to use AI features

### 1. Clone the repository

```bash
git clone https://github.com/siddhiawasare09/CreatorCircle.git
cd CreatorCircle
```

### 2. Configure the server

Create `server/.env` and set at least `MONGODB_URI` and `JWT_SECRET`. Add `GEMINI_API_KEY` to enable AI features. For password-reset email delivery, also configure the SMTP values and `CLIENT_URL` from the environment reference.

```bash
cd server
npm install
npm run dev
```

The API starts on port `5000` by default. Its health endpoint is `http://localhost:5000/api/health`.

### 3. Configure and run the client

In a second terminal, from the repository root:

```bash
cd client
npm install
npm run dev
```

Vite prints the local client URL when it starts. To point the client at a non-default API, create `client/.env` and set `VITE_API_URL`, for example:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

The server and client are started separately; there is no root-level combined development script. The client also provides `npm run build`, `npm run preview`, and `npm run lint`. The server provides `npm start` for a non-watch run and `npm run make-admin` for its admin-creation script.

## AWS deployment overview

The intended production arrangement is to host the Node.js/Express API on an AWS EC2 instance, keep it running under **PM2**, and use **Nginx** as a reverse proxy in front of the API. Build the React client with `npm run build` and serve its static output through a web server or suitable static hosting. Configure production environment variables on the server and point the client API URL at the public API endpoint.

This repository does not include EC2 provisioning scripts, an Nginx site configuration, or a PM2 ecosystem file; those deployment steps need to be configured for the target environment.

## Author

**Siddhi Awasare** — [@siddhiawasare09](https://github.com/siddhiawasare09)
