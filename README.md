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



analyze it carefully 'Analyze the entire existing page carefully and implement the following improvements while maintaining the current design, functionality, and code structure.

1. Create a Separate Download PDF Component
Analyze all existing code related to the Download PDF button.
Extract the complete Download PDF functionality into a separate, reusable component.
Import and use this component on the current page.
Keep the component clean, reusable, and properly structured.
Ensure all existing download functionality continues to work correctly.
2. Replace Browser Alerts with Professional Popups
Find all existing browser alerts (alert(), confirm(), etc.) related to the download functionality.
Replace them with modern, professional-looking custom popup notifications.
Popups should look like those used on professional websites.
On mobile devices, notifications should appear near the bottom of the screen.
On desktop, position them appropriately without blocking the main content.
Add smooth fade-in and fade-out animations.
Ensure the popup is responsive and visually consistent with the website's design.
3. Fix PDF and Word Download Behavior
When the user clicks Download PDF or Download MS Word, the file should download directly.
After downloading, do not open any new browser tab or window.
Keep the user on the current page.
Preserve the existing PDF and Word document generation functionality.
Handle download errors using professional popup notifications instead of browser alerts.
4. Improve Mobile Download Buttons
On mobile screens, position the Download PDF and Download MS Word buttons at the bottom of the CV preview area.
Do not display these buttons at the top of the page on mobile.
Make them appear smoothly with a professional transition or animation.
Ensure both buttons are properly aligned, responsive, and easy to tap.
Maintain the existing desktop button layout unless improvements are necessary.
5. Add a Back Button
Add a professional Back button with an icon in the top-left or top-right corner.
On desktop, display the icon and text.
On mobile, display only the back icon to save space.
When clicked, navigate the user back to the previous CV preview page.
Use the existing navigation or routing logic.
Do not break browser navigation or existing page functionality.
6. Fix Extra Spacing in PDF Design
Carefully analyze the generated PDF layout.
Remove unnecessary blank spaces, excessive margins, and unwanted gaps.
Make the final PDF look like a professionally designed CV/resume.
Ensure content is properly aligned and distributed across the page.
Maintain consistent spacing between sections, headings, paragraphs, and other CV elements.
Avoid unnecessary blank pages or excessive whitespace.
Ensure the final PDF looks polished and professional.
7. Improve CV Readability on Mobile and Desktop
Make all CV section headings and their associated content more readable.
Improve heading font weight, font size, contrast, and spacing where necessary.
Use appropriate bold formatting to distinguish headings from their content.
Ensure text is sharp, clear, and easy to read on mobile and desktop.
Prevent text from becoming too small, compressed, or difficult to understand on mobile devices.
Maintain a professional resume design across all screen sizes.
8. Remove Unnecessary Loaders
Analyze the entire page for extra, duplicate, or unnecessary loading indicators.
Remove redundant loaders that do not serve a real purpose.
Keep only essential loading indicators for actual asynchronous operations, such as PDF or Word generation, if needed.
Avoid unnecessary loading animations that affect the user experience.
9. Important Implementation Requirements
First understand the existing page, components, dependencies, and functionality before making changes.
Do not rebuild the entire page unnecessarily.
Do not remove or break any existing features.
Reuse existing libraries and dependencies wherever possible.
Follow the existing project architecture and coding conventions.
Keep the code clean, optimized, reusable, and maintainable.
Ensure all changes work correctly on mobile, tablet, and desktop.
Do not introduce unnecessary dependencies.
10. Final Testing

After implementation, verify the following:

PDF downloads successfully without opening a new tab.
MS Word downloads successfully without opening a new tab.
Professional popups replace all browser alerts.
Mobile notifications appear near the bottom.
Mobile download buttons appear at the bottom, not the top.
Back button works correctly.
Mobile back button displays only its icon.
PDF has no unnecessary blank spaces or layout issues.
CV headings and content are clearly readable on mobile and desktop.
No unnecessary loaders remain.
Existing CV preview and download functionality works as before.

Important: Implement these changes directly in the existing project. Do not just provide suggestions or example code. Analyze the actual code, make the required modifications, and ensure everything works properly without breaking existing functionality.'