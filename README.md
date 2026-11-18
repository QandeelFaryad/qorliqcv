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

CV Builder – Success Page UI/UX Redesign & Download Functionality Fix

Improve the existing CV Builder Success Page with a clean, modern, professional, fully responsive, and user-friendly design. Focus on visual hierarchy, readability, smooth animations, and a consistent experience across desktop and mobile devices.

IMPORTANT: Preserve all existing business logic, functionality, API integrations, backend operations, and application workflows. Do not break or unnecessarily rewrite existing functionality. Only improve the UI/UX and fix the specific download issue described below.

1. Modern UI/UX Design
Redesign the entire CV Builder Success Page with a clean, modern, minimal, and professional interface.
Maintain the existing design hierarchy and information structure.
Keep the current content and functionality intact.
Improve typography, font sizes, font weights, colors, contrast, alignment, and visual consistency.
Ensure that CV content is clearly readable on both desktop and mobile devices.
Remove unnecessary whitespace, excessive padding, unwanted margins, and extra spacing.
Maintain balanced spacing between sections and elements.
Ensure the CV preview looks polished and professional without compromising its original structure.
Use a consistent design system for buttons, cards, notifications, popups, and other UI elements.
2. Responsive Download Buttons
Desktop
Display both download buttons in the top-right corner:
Download PDF
Download MS Word
Include appropriate icons alongside button labels.
Make buttons visually clear, accessible, and consistent with the overall design.
Maintain proper alignment and spacing.
Mobile
Display both download buttons in a fixed bottom action bar.
Ensure the action bar remains accessible while scrolling.
Include icons and clear labels.
Add sufficient bottom padding to the page content so the fixed bar never overlaps the CV preview or other content.
Account for mobile safe-area insets.
3. Notifications and Error Messages
All error notifications, success messages, and alerts should appear at the top of the screen.
Use a clean, modern toast notification design.
Include appropriate icons for success, warning, and error states.
Add smooth entrance and exit animations.
Notifications should be readable and should not obstruct important content.
Automatically dismiss notifications when appropriate, while allowing users enough time to read them.
4. Download Limit Reached Popup

Redesign the existing download-limit popup to match the new visual design system.

Desktop behavior:

Display the popup centered in the middle of the screen.
Use a polished modal with a subtle backdrop.
Maintain proper spacing, typography, and button hierarchy.

Mobile behavior:

Display the popup as a bottom sheet.
It should smoothly slide upward from the bottom of the screen.
Use a natural mobile-style transition, similar to a notification or navigation panel dropping down from the top of a mobile interface.
Add rounded top corners and appropriate bottom safe-area spacing.
Ensure the popup is easy to read and interact with.

Preserve the existing download-limit validation and restriction logic. Only improve the popup's appearance and interaction.

5. Smooth Motion Animations

Implement polished animations throughout the Success Page using the existing animation library or Framer Motion if it is already available.

Include:

Smooth page entrance animations.
Subtle fade-in and slide-up animations for content sections.
Smooth hover and tap interactions for buttons.
Animated toast notifications.
Smooth modal and bottom-sheet transitions.
Subtle transitions when changing UI states.
Loading animations when downloads are being processed.

Animations should feel natural, lightweight, and professional.

Avoid excessive animations, unnecessary bouncing, or effects that negatively affect performance.

Respect prefers-reduced-motion accessibility settings.

6. Prevent Double Clicks and Duplicate Downloads

Implement proper double-click protection for all download buttons and popup action buttons.

Requirements:

Prevent users from triggering multiple downloads by rapidly clicking a button.
Disable the relevant button immediately when an operation starts.
Show an appropriate loading state with a spinner or loading indicator.
Prevent duplicate API requests and duplicate download operations.
Restore the button's normal state after the operation finishes or fails.
Use proper loading state management and cleanup.
Ensure repeated clicks cannot bypass download limits or trigger duplicate operations.

Important: Do not rely only on disabling the button visually. Protect the actual download action using appropriate state or request-level safeguards.

7. Fix MS Word Download Content Extraction

This is a critical functional bug that must be fixed.

Currently:

PDF downloads successfully.
The CV data/content is extracted correctly in the downloaded PDF.
However, the downloaded MS Word document does not properly extract or display the CV content.

Investigate the existing PDF and MS Word download implementations.

Identify why the PDF export extracts the CV content correctly while the MS Word export does not.

Fix the MS Word export so that:

It extracts the same CV content as the PDF export.
All CV sections and their corresponding data are included.
Personal information, professional summary, work experience, education, skills, projects, certifications, and other available sections are preserved.
Dynamic and user-generated CV content is correctly included.
Content formatting, section hierarchy, headings, and spacing remain readable.
The generated Word document contains actual editable CV content, not an empty document or incomplete content.
The exported Word document maintains a professional layout.

Compare the existing PDF and Word export pipelines and reuse the same reliable CV data source wherever possible.

Do not hardcode CV content or create a separate data source for Word exports.

Important: Preserve the existing MS Word download mechanism, backend integrations, and business logic wherever possible. Fix the underlying extraction or document-generation issue rather than replacing the entire export architecture unnecessarily.

8. Maintain Existing Functionality

This is a UI/UX improvement and targeted bug-fix task, not a complete application rewrite.

Strictly preserve:

Existing CV generation logic.
Existing CV templates.
Existing download APIs and endpoints.
Existing PDF generation functionality.
Existing MS Word export functionality, except for the required bug fix.
Existing download-limit validation.
Existing authentication and authorization.
Existing user data and CV content.
Existing navigation and application workflows.

Do not remove working functionality or introduce unnecessary dependencies.

9. Final Quality and Testing Requirements

After implementation, verify the following:

Success Page has a clean, modern design.
Existing design hierarchy is preserved.
CV content is readable on desktop and mobile.
Unnecessary whitespace and spacing are removed.
Desktop download buttons appear in the top-right corner with icons.
Mobile download buttons remain fixed at the bottom.
Error and success notifications appear at the top.
Download-limit popup is centered on desktop.
Download-limit popup slides up from the bottom on mobile.
Animations work smoothly across screen sizes.
Double-click protection prevents duplicate downloads.
PDF downloads still work exactly as before.
MS Word downloads now correctly extract and include all CV content.
Download limits and existing business rules remain unchanged.
No existing functionality is broken.
No layout overflow or overlapping elements on mobile.
10. Implementation Instructions

Before making changes:

Inspect the existing Success Page components and their styling.
Understand the current PDF and MS Word download workflows.
Identify the exact cause of the MS Word content extraction issue.
Identify reusable components and existing animation utilities.
Make targeted changes instead of rewriting working code.

After implementation:

Test the page on desktop, tablet, and mobile screen sizes.
Test both download formats using actual generated CV data.
Verify that all CV sections appear in the downloaded Word document.
Test download-limit behavior.
Test rapid repeated clicks and duplicate request prevention