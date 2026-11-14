Qorliq CV Builder
A full-stack CV builder built with Next.js. Users can create professional CVs, import an existing CV, choose a template, edit their details with a live preview, and download their CV in PDF or Word format.

The application includes authentication, Stripe payments, subscription management, and a personal dashboard.
Features
CV Creation & Editing
- Professional Templates: Choose from multiple CV layouts.
- Upload Existing CV: Import PDF, DOC, DOCX, or TXT files to extract information and populate the editor.
- Step-by-Step Editor: Add personal details, summary, experience, education, skills, languages, certifications, projects, and more.
- Live Preview: Preview changes while editing.
- PDF & Word Downloads: Export completed CVs.
- Responsive Layout: Create and manage CVs on mobile, tablet, and desktop.
User Dashboard
- My CVs: View and manage saved CVs.
- Download History: Track CV download activity.
- Account Settings: Manage personal account details.
- Billing Details: Update billing contact information and address.
- Plan Management: View current plan status and access expiry.
- Cancellation: Cancel paid access and return to the free account state.
Authentication & Payments
- Secure Login: Sign in with Google or email and password.
- User-Specific Records: Users can access only their own saved CVs.
- Stripe Integration: Support for one-time payments and recurring subscriptions.
- Payment Verification: Verify payments and process subscription updates through Stripe webhooks.
- Access Control: Restrict paid features according to the user's plan and access status.
Tech Stack
Area	Technologies
Frontend	Next.js, React, Tailwind CSS
Backend	Next.js API Routes
Database	MongoDB, Mongoose
Authentication	NextAuth.js, bcryptjs
Payments	Stripe
CV Extraction	pdf2json, Mammoth, word-extractor, Tesseract.js


Development Challenges & Solutions
CV Data Extraction
Challenge: Uploaded CVs use different layouts, headings, and date formats.

Approach: Extract text using format-specific libraries and apply parsing rules to identify contact details, experience, education, and other sections. Users can review and correct imported information in the editor.
Authentication & Data Ownership
Challenge: Keep each user's CVs and account information private.

Approach: Identify the logged-in user through the server session and scope database queries to their user ID.
Payment & Subscription Synchronization
Challenge: Keep application access consistent with payment and subscription status.

Approach: Use Stripe verification endpoints and webhooks to update plan details, payment status, and access dates.
Responsive Editing & Preview
Challenge: Display an A4 CV preview clearly alongside the editor on smaller screens.

Approach: Use responsive layouts and separate editing and preview views on mobile.
Billing & Cancellation
Challenge: Allow users to update billing information and cancel paid access.

Approach: Use authenticated APIs to update billing fields, cancel recurring Stripe subscriptions, and reset CV access fields to their default values.
Getting Started
Clone the repository:
git clone https://github.com/QandeelFaryad/qorliqcv.git
cd qorliqcv

Install dependencies:
npm install

Create a .env.local file and configure the environment variables used by the project, including MongoDB, NextAuth, Google authentication, and Stripe credentials.

Start the development server:
npm run dev

Open http://localhost:3000.
Production Build
npm run build
npm start

Repository
Qorliq CV Builder on GitHub

