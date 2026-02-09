Section 5: MARKETING (GROWTH)
UX Context: Sidebar Group `MARKETING`.
Goal: Turning the database into revenue (Inbound & Outbound).

## MODULE 5.1: MARKETING HUB (The Pulse)
 Purpose: ROI Tracking and Revenue Attribution.
 Key Metrics:
     CAC (Customer Acquisition Cost): Total Ad Spend / New Customers.
     Campaign ROI: Revenue generated per Campaign ID.
     Lead Source Breakdown: Pie chart (Google Ads vs Referrals vs Facebook).
 Live Feed: Stream of marketing events (e.g., "Steve clicked 'Winter Special'", "Sarah submitted 'Get Quote'").

## MODULE 5.2: CAMPAIGNS & TEMPLATES (The Engine)
 Purpose: Outbound blasting and standardized communication.
 Global Template Library:
     Scope: Central repository for ALL system emails/SMS (Sales, Service, Marketing).
     Features:
         Drag-and-Drop Editor: HTML builder for newsletters.
         Variables: Dynamic insertion `{{client.first_name}}`, `{{job.last_service_date}}`.
         Categories: "Sales Outreach", "Service Reminders", "Newsletters".
 Automation Logic:
     Smart Segmentation: Filter by Data (e.g., `System Age > 3 Years` AND `Zone = North`).
     Drip Sequences: Multi-step flows (Email -> wait 2 days -> SMS).
     Safety: "Set and Forget" enabled, with optional "Approval Queue" for huge blasts (>500 recipients).

## MODULE 5.3: INBOUND ENGINE (Forms & Widgets)
 Purpose: Capturing traffic from the website.
 Form Builder:
     Drag-and-Drop: Create forms (Name, Email, Phone, File Upload).
     Logic: "If Service = Solar, Show 'Bill Amount' field."
     Embed Code: Generates HTML snippet for WordPress/Wix.
 Chat Widget:
     Floating "Chat Bubble" for client website.
     Routing: Messages pipe directly to Sales Inbox (Section 1).
 Calculators (Industry Specific):
     ROI Calculator / Finance Repayment Calculator widget.

## MODULE 5.4: REPUTATION MANAGER (Reviews)
 Purpose: Automating social proof (Google/Facebook).
 The "Gatekeeper" Workflow:
     Trigger: Job Status = "Complete".
     Step 1: Send SMS/Email: "How did we do? (Thumbs Up / Thumbs Down)".
     Logic:
         If Thumbs Up: Redirect to Google Maps Review Page.
         If Thumbs Down: Redirect to Private Internal Feedback Form (Protects public rating).
 Review Responder:
     Central dashboard to read/reply to Google Reviews API.

## MODULE 5.5: REFERRAL ENGINE
 Purpose: Tracking and rewarding word-of-mouth.
 Mechanism:
     Unique Links: Auto-generate `domain.com/ref/client-name` for every Contact.
     Affiliate Portal: Simple view for partners (e.g., Builders) to see leads they sent.
 Reward Logic:
     If `Lead Source` = `Referral Link` AND `Status` = `Won`:
     Create "Pay Referral Bonus" Task for Admin.

## MODULE 5.6: AI CREATIVE SUITE
 Purpose: Content generation for non-marketers.
 Tech Stack: OpenAI API Integration.
 Features:
     Ad Copy Generator: Input Offer -> Output FB/Google Ad text.
     Review Responder: AI drafts professional replies to 1-star and 5-star reviews.
     Image Gen: Simple prompt-to-image for email headers.