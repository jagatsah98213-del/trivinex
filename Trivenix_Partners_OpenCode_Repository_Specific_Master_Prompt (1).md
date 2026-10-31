# MASTER EXECUTION PROMPT — FINISH THE EXISTING TRIVENIX PARTNERS WEBSITE
## For OpenCode / an autonomous coding agent
## Inputs you will receive: this prompt + the original `own-main.zip`

You are not being asked to brainstorm, write a technical proposal, or create a second disconnected demo. You are being asked to take the supplied ZIP, understand the actual existing application, make the necessary product and engineering decisions, implement the changes directly in the repository, test them, and leave a clean, deployable website.

Act as a principal product architect, senior full-stack engineer, UX/UI designer, security engineer, database engineer and QA lead. Think through the business, user experience, data model, operational realities and security yourself. I am relying on your judgement. Do not make me decide routine product or technical details. Do not stop after an audit. **Inspect → decide → implement → test → fix → document.**

The owner will provide only this prompt and the ZIP. Do not assume the company report PDF will be supplied separately. The company facts and rules you need are included below.

---

# 1. What is actually in the supplied ZIP

The archive is the existing project named `own-main`. It is a pnpm workspace monorepo, not a blank project.

The existing architecture is:

- `artifacts/craftloop/` — React 19 + Vite + Tailwind + shadcn/ui frontend, Wouter routing, TanStack Query, Framer Motion.
- `artifacts/api-server/` — Express 5 API, Zod validation, Nodemailer, Express sessions, PostgreSQL session store, Pino logging.
- `lib/db/` — Drizzle ORM with PostgreSQL/Neon.
- `lib/api-spec/` — OpenAPI specification and code generation.
- `lib/api-zod/` and `lib/api-client-react/` — generated schemas, types and React Query API hooks.
- `artifacts/mockup-sandbox/` — separate mockup playground, not the production site.
- `attached_assets/` — original design references, generated images and two earlier project briefs. Inspect these assets before deleting anything. Retain images that the real site uses or that materially support the final design; remove only genuinely unused files.
- Root deployment/workspace files include `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `railway.toml`, `railpack.json`, `Procfile`, frontend `vercel.json`, `.env.example`, `.gitignore` and `replit.md`.

Important existing source files/features discovered in this project:
- Frontend public pages currently include Home, Services, ServiceDetail, Portfolio, About, Quote, Consultation, Testimonials and PrivacyPolicy.
- Public Careers and Freelancers pages currently exist and must be removed from the public product.
- Admin pages currently include Dashboard, Applicants, Inquiries, Consultations, Projects, SiteContent and AuditLog.
- The API already has public and admin route modules, admin authentication, PostgreSQL-backed sessions, inquiries, consultation bookings, projects, services, service plans, portfolio items, testimonials, FAQs, site settings and audit logs.
- Existing testimonial database records currently only support `clientName`, `quote`, `rating` and `isPublished`. The public testimonials page is text-oriented; the admin SiteContent page primarily moderates/publishes testimonials. There is no complete video-testimonial/live-demo content model yet.
- Existing portfolio records have `mediaType`, `mediaUrl`, `thumbnailUrl`, featured state and sort order, but do not fully model a separate live demo website URL.
- The current service taxonomy combines Photography & Videography and combines SEO & Digital Marketing. The business model requires these to be separate service divisions.
- The existing email helper uses Nodemailer but catches and logs failures without returning delivery status to the inquiry flow. It needs proper delivery state/error handling.
- The existing `.env.example` and `replit.md` document a dangerous `ADMIN_ACCESS_KEY` + `VITE_ADMIN_KEY` + `?key=` login URL pattern and also contain a predictable seeded admin password. Treat these as security defects. Remove them, not merely hide them.
- The existing seed script contains hard-coded USD starting prices, sample testimonials/portfolio and a default admin account/password. These require a careful correction; do not publish fabricated proof or default credentials.
- `artifacts/mockup-sandbox/` is a separate mockup app and should not ship with the production website unless inspection proves a required runtime dependency (highly unlikely).
- There is both `pnpm-lock.yaml` and an obsolete `package-lock.json`. This is a pnpm project; retain the pnpm workspace and correct pnpm lockfile, remove the obsolete npm lockfile.
- The existing API spec is the source of truth for generated API clients. Update the spec and run the repository's code generation; do not only hand-edit generated files.

Treat this inventory as an initial map, not a substitute for inspecting the full code. Verify all references before deleting or changing any module.

---

# 2. Brand name discrepancy — resolve consistently

The supplied company report and several legacy project files spell the name **“Trivinex Partners”**. The latest instruction for this build uses **“Trivenix Partners”**. For this implementation, follow the latest instruction and use exactly:

# Trivenix Partners

Use this spelling consistently in all public branding, title tags, metadata, UI copy, email templates, seed content, admin settings defaults, favicon/alt text, structured data, documentation and package naming where appropriate.

Remove the old “Craft Loop” / “Craftloop” identity completely from visible branding and configuration. Do not leave mixed spellings or old product identity in the finished site. Do not use the company-name spelling discrepancy as a reason to stop; latest instruction wins.

Brand tagline:
**One Network. Many Skills. One Digital Partner.**

Brand positioning:
**Trivenix Partners is a founder-led, fully online digital services company that helps businesses access multiple digital and creative services through one managed company relationship, coordinating suitable remote professionals and reviewing work before delivery.**

Do not describe the company as a freelance marketplace. The client hires Trivenix Partners, not an individual freelancer. Trivenix manages client communication, requirements, quotation, coordination, quality control, revisions and delivery.

---

# 3. Company truth: use these facts, not generic agency assumptions

## Current stage and operating model

The company report describes the current stage as:
- Founder-led
- Fully remote / online
- No permanent physical office required for current operations
- Growing distributed professional network
- Early-stage business development
- Current operational focus can include Nepal and India
- Worldwide service ambition; accept international inquiries where the service can reasonably be delivered, but do not claim mature global operations that do not yet exist

The report describes the future vision as:
- Formal company registration
- Physical corporate operations
- Thousands of remote professionals
- Thousands of business clients
- Worldwide network and operations
- Structured departments
- Advanced project-management technology
- Long-term business partnerships

Present future items as aspirations, never as current facts. Do not invent an office, legal registration, employee count, client count, awards, certifications, revenue, client logos, project outcomes or service guarantees.

The report names Jagat Narayan Sah as Founder & CEO and describes a Co-Founder role without naming that person. Do not invent the co-founder's name. A concise founder-led statement is sufficient; only show personal names where the existing approved company content clearly supports them.

## Why the company exists

The company was created to bridge two needs:
1. Businesses want reliable, affordable, understandable digital services but often struggle to coordinate multiple providers.
2. Skilled professionals have capabilities but may struggle to find consistent project opportunities.

Trivenix aims to connect these needs through one managed company.

## Mission

Preserve this meaning:
“Digitalize businesses by providing accessible, professional and effective digital services while creating meaningful opportunities for skilled professionals and building a global network that makes business content, digital presence and marketing easier, more effective and more accessible.”

## Vision

Build from a fully remote online operation into a major global company with a formal corporate presence, worldwide operations, a large distributed professional network, long-term business partnerships and technology that makes collaboration and project management efficient.

## Values

- Quality
- Honesty
- Transparency
- Friendly communication
- Accessibility / affordable service
- Professionalism
- Freedom and flexible remote work for professionals
- Opportunity for skilled people

The brand voice must be friendly, clear, professional, confident and human. Explain technical matters in simple language. Avoid hollow marketing language, exaggerated claims and unnecessary jargon.

## Business model — preserve this distinction

The intended delivery flow is:

Client → Trivenix Partners → suitable professional → Trivenix Partners quality review → Client

The client relationship belongs to Trivenix Partners. The client generally communicates through Trivenix Partners rather than negotiating directly with the assigned professional. The professional works remotely and submits work to the company. Management reviews work before final delivery.

Do not expose internal professional contact details, internal commission rates, payout details, recruitment records or management processes on the public site.

---

# 4. Service divisions — use the report and correct the existing combined taxonomy

The public website must show these as eight clear service divisions. Do not merge SEO with Digital Marketing. Do not merge Photography with Videography.

1. **Web Development**
   - Business and corporate websites
   - Portfolio websites
   - Restaurant and hotel websites
   - Clinic/doctor and education websites
   - Startup websites
   - E-commerce
   - Landing pages
   - Custom web applications
   - Website redesign and maintenance
   - Responsive development
   - Admin systems and custom functionality
   - Website consultation
   - Explain the difference between pre-built solutions and fully customized solutions.

2. **Video Editing**
   - Wedding edits and photo/video compilations
   - YouTube long-form
   - YouTube Shorts, Instagram Reels and TikTok
   - Business promotional, product, event, music, social-ad, cinematic, corporate and educational videos
   - Color correction/grading, motion graphics, transitions and captions.

3. **Graphic Design**
   - Logo and brand identity
   - Social media graphics
   - Posters, flyers, business cards and banners
   - Advertisements and YouTube thumbnails
   - Product graphics
   - Promotional and presentation graphics
   - Digital marketing creatives and custom design.

4. **Photography**
   - Business, product, restaurant, hotel, event, wedding, portrait, social-media and promotional photography
   - Location-based photography, depending on the availability of a suitable professional in the requested location.

5. **Videography**
   - Weddings and events
   - Business promotional videos
   - Restaurant/hotel and product videos
   - Interviews, social-media content and music videos
   - Corporate content and promotional campaigns.

6. **SEO**
   - Website SEO
   - Keyword research
   - On-page SEO
   - Technical SEO
   - Local SEO
   - Google Business Profile optimization
   - Content optimization
   - SEO strategy and search-performance analysis
   - Website SEO audits and ongoing SEO management
   - Never guarantee a particular search ranking.

7. **Script & Content Writing**
   - YouTube scripts and short-form scripts
   - Advertisement scripts
   - Business and website content
   - Social-media captions and promotional copy
   - Educational content, video concepts and storytelling.

8. **Digital Marketing**
   - Social-media marketing and strategy
   - Campaign planning
   - Digital advertising
   - Promotional campaigns
   - Content strategy
   - Audience development
   - Business promotion and marketing consultation
   - Keep this distinct from SEO.

The company can serve small and medium businesses, startups, larger companies, restaurants, hotels, doctors and clinics, educational institutions, influencers, YouTubers, musicians, artists, wedding clients, individual professionals, NGOs, organizations and international businesses.

A core selling point is **one client can combine several services through one managed relationship**. For example, a restaurant may request a website + photography + video + graphic design + SEO + digital marketing. A creator may need scripts + editing + thumbnails + social content.

## Service plans

The ZIP includes an earlier service sub-plan brief and existing `ServicePlan` schema/API functionality. Preserve and improve this feature rather than discarding it.

Use sensible editable sub-plans under the eight divisions. The earlier brief contains useful examples:
- Web Development: Starter Website, Custom Web Development, E-commerce Website, Monthly Website Management.
- Video Editing: Reel & Short-Form Editing, Long-Form Video Editing, Wedding Video Editing, Corporate & Promo Video Editing.
- Photography: Event Photography, Product Photography, Portrait & Personal Branding, Wedding Photography.
- Videography: Wedding Videography, Event Videography, Business/Restaurant/Hotel Promotional Video, Product/Interview/Social Content.
- Graphic Design: Logo & Brand Identity, Social Media Creative Pack, Print & Packaging Design, Custom Design Project.
- Script & Content Writing: Blog & Article Writing, Website Copywriting, SEO Content Writing, Social Media Captions & Content, YouTube/Short-form Scriptwriting.
- SEO: SEO Audit & On-Page Optimization, Monthly SEO Management, Local SEO / Google Business Profile.
- Digital Marketing: Social Media Strategy/Management, Paid Ads Management, Campaign Planning, Content Strategy.

Treat these as editable starter categories, not as an assertion that every plan is currently available in every region. Seed descriptive names and accurate descriptions. Do **not** seed invented starting prices or unsupported price figures. Leave price labels blank or show “Request a quote” until the owner sets real prices. Badges such as Hot/New/Popular must be admin-controlled and should not be used to imply customer popularity without evidence.

---

# 5. Pricing and client policies — preserve the actual company philosophy

Pricing position:
**Affordable and mid-range pricing with premium-quality service.** The company does not compete only by being the cheapest. It aims to combine affordability, professional service, transparency and quality.

Final pricing depends on:
- Service type and complexity
- Number of deliverables
- Project duration
- Professional expertise
- Revisions
- Urgency
- Required equipment
- Client requirements
- Customization and scope changes

The company may quote in NPR, INR or USD. Currency and payment method are agreed during the individual client agreement. Do not hard-code a universal price list or invent price figures.

Client process:
1. Contact Trivenix through the website or configured official contact channels.
2. Discuss needs, goals, service, quantity, quality expectations, timeline, available materials, budget and technical requirements.
3. Recommend an appropriate service/plan.
4. Provide a quotation based on the actual project.
5. Agree on scope, price, timeline and terms.
6. Arrange payment according to the agreed schedule.
7. Select/assign an appropriate professional.
8. Complete production remotely.
9. Review quality.
10. Coordinate reasonable revisions.
11. Deliver approved work to the client.
12. Close the project when requirements and payment obligations are fulfilled.

Client-facing policy principles:
- Standard projects may include approximately 5–6 reasonable revision rounds, depending on the service/package and the written agreement.
- Revisions normally relate to the original agreed scope.
- New requirements or major scope changes may require a revised quote and timeline.
- If the client delays required information, images, videos, documents, approvals, feedback or access, the deadline may be extended and extra costs may apply where appropriate.
- The client is responsible for the accuracy and lawful use of materials/information they supply.
- Refund decisions depend on service type, project stage, completed work, cancellation, professional/third-party expenses, payment status and the project agreement. A full refund is not automatic after substantial work has been completed.
- Client cancellation after work begins may result in retaining an appropriate amount for completed work, professional payments, resources and expenses; any remaining refund is determined by the agreement.
- Client work belongs to the client after applicable full payment, subject to the project agreement and third-party licensing.
- Source/editable files are transferred only where included in the project agreement and after full payment.
- Confidential/private client work is not displayed publicly without permission.
- The company may use completed work for portfolio/case studies/marketing only with appropriate client permission.
- Disputes should first be addressed through good-faith discussion/negotiation.
- Do not guarantee SEO rankings, leads, sales, revenue, audience growth or any specific business outcome.
- Project-specific written agreements govern the engagement.

Pre-built website policy:
The report says ready-made website solutions may be offered for affordability and speed, with limited customization, and mentions a 7-day-related promotional/package policy “where specified.” Do not invent the exact offer, conditions or refund promise. Only display a 7-day offer if the owner can configure its exact terms in admin; otherwise describe pre-built and custom solutions without promising a specific deal.

---

# 6. Product scope — public client website + private admin only

This is a client-facing company website, not a marketplace or employment platform.

## Public visitors can:
- Learn what the company does
- Browse services and service plans
- View genuine approved portfolio/case studies
- View genuine testimonials, including video testimonials
- Open a related live demo website from a testimonial or portfolio item
- Read About, FAQs, Privacy Policy and Service Terms
- Ask an informational AI assistant about the company and the page they are viewing
- Submit a contact/consultation/quotation inquiry
- Use configured email/WhatsApp/phone/social links

## Admin can:
- Sign in to a private admin dashboard
- Manage public website content
- Manage services and sub-plans
- Manage portfolio/case studies and media
- Manage testimonials and video/demo links
- Manage FAQs and approved AI knowledge content
- Review inquiries and consultations
- Manage website contact/social/SEO settings
- See email/AI/storage integration status without exposing credentials
- Review important audit events

## Explicit exclusions
Do not create or retain any public:
- Freelancer/professional signup or registration
- Careers or job listing page
- Job application form
- Applicant portal
- Interview booking for candidates
- Employee login/dashboard
- Employee self-service portal
- Client signup/login/account
- Client-facing project tracking portal
- Payment portal or payment collection system

There must be no public client account creation and no client sign-in.

The report's professional network is part of the company's business model and mission, but the owner explicitly does not want an employment portal. You may explain the distributed professional-network model briefly on the About page as part of how the company delivers work. Do not advertise job applications, guaranteed employment or recruitment. Do not expose recruitment forms or applicant data.

### Preserve useful internal systems carefully
The existing repository contains admin project management, consultation booking, project assignments, employees, applicants, interview slots and related database/API modules. Do not blindly delete everything with “employee” in its name:
- Remove public recruitment/candidate routes, forms, links, email templates and interview booking flows.
- Remove employee login/self-service routes if present.
- Keep the private admin-only project/assignment features only if they are functional and useful to manage delivery through the professional network.
- If internal professional/employee records are needed by admin project assignment, keep them private and admin-only; do not build a public employee portal.
- Remove applicant and interview data models/endpoints if no longer needed by any remaining internal workflow. If historical data exists, migrate/archive safely rather than dropping it blindly.
- Keep client consultation/meeting booking if it is a working client service. It is not an employment portal.
- Keep admin-only project tracking if useful; it must not become a public client account feature.

Do not remove working client functionality merely because it was built alongside recruitment functionality. Inspect dependencies and make a deliberate keep/remove decision.

---

# 7. Public website information architecture and UX

Build a coherent, premium, credible digital services company website. It should not look like a generic AI-generated agency template or a freelancer marketplace.

Recommended routes (adapt existing route structure):
- `/` — Home
- `/about` — About Trivenix Partners
- `/services` — Services and sub-plans
- `/services/:slug` — Individual service details
- `/portfolio` — Portfolio / selected work
- `/testimonials` — Testimonials
- `/contact` or `/quote` — Inquiry / request a quote
- `/consultation` — Keep only if the existing consultation flow is genuinely useful and working
- `/privacy-policy` — Privacy policy
- `/terms` or `/service-terms` — Client service terms and policies
- `/faq` — optional dedicated FAQ if useful; otherwise integrate FAQs into relevant pages

Do not create a route for a page merely to satisfy a checklist. Every public page must have a clear purpose, useful content and working navigation.

## Homepage structure

Design a strong homepage with:
1. Header/navigation, logo, mobile menu and clear contact/quote CTA.
2. Hero section explaining in plain English what Trivenix Partners does and why one managed digital partner is useful.
3. The core value proposition: multiple digital services, one coordinated company relationship.
4. Service overview for all eight divisions.
5. “One partner, multiple solutions” section with realistic examples (restaurant, creator, business).
6. How it works: inquiry → discussion → recommendation/quote → agreement → production → quality review → delivery.
7. Selected portfolio/case studies with demo links.
8. Video/text testimonial showcase (only real approved testimonials).
9. Why Trivenix: transparent communication, reasonable pricing, professional quality control, coordinated services and flexible remote network.
10. Industries/client categories.
11. FAQs.
12. Contact/consultation CTA.
13. Footer with About, Services, Portfolio, Testimonials, Privacy, Terms and configured contact/social details.

## About page

Explain:
- Why Trivenix Partners was created
- The business/professional opportunity gap it aims to address
- Mission, vision and values
- Current founder-led, fully online model
- How the hybrid agency + professional network works
- The company's client communication and quality-review approach
- Future vision clearly labeled as future ambition

Do not turn the About page into a public employee recruitment pitch.

## Design direction

Create a distinct, premium and consistent design:
- Modern, refined, confident, clean
- Deep navy/near-black and white/light surfaces
- Controlled blue and purple accents that suit the supplied brand assets
- Excellent typography, line lengths, hierarchy and whitespace
- Strong responsive grid and deliberate page composition
- Subtle gradients and restrained glass/depth effects only where appropriate
- Smooth, subtle micro-interactions
- Thoughtful use of the supplied logo and useful image assets
- Real service-relevant imagery, not random stock visuals
- Consistent buttons, cards, forms, menus, dialogs, navigation and footer

Avoid:
- Excessive blur/glass everywhere
- Excessive animation, scroll effects and parallax
- Fake counters, fake client logos and unsupported statistics
- Generic filler text
- Auto-playing video with sound
- Unnecessary heavy dependencies
- Overcrowded mobile layouts
- Any horizontal overflow

Use semantic, accessible, keyboard-friendly components. Support reduced motion. Make the site excellent on ordinary Android phones and modest connections as well as desktop.

---

# 8. Testimonials and portfolio: high-priority feature

This is one of the most important requested improvements.

## Video testimonials with live demo links

The public testimonial system must support:
- Text-only testimonials
- Video testimonials
- Optional portrait/avatar/thumbnail
- A separate related live demo website link
- Optional related service and portfolio item

Admin must be able to create, view, edit, publish/unpublish, reorder and delete testimonials.

Recommended testimonial data fields:
- Display name / client or business name (optional)
- Role or company (optional)
- Approved testimonial text/quote
- Optional rating (do not force a rating)
- Optional avatar/thumbnail/poster image
- Video source type: uploaded file, YouTube, Vimeo or safe external video URL
- Video URL / persistent media URL
- Related live demo URL (separate field from the video URL)
- Demo button label (e.g. “View live demo”)
- Related service category
- Optional related portfolio item
- Caption/alt text
- Published/draft status
- Sort order
- Created/updated timestamps

Public UI requirements:
- Show a clear play affordance for video testimonials.
- Never autoplay with sound.
- Use accessible playback controls and captions where available.
- Support YouTube/Vimeo using safe embed URL construction and privacy-enhanced options where supported.
- A live demo URL is a separate button/link and must never be confused with the video URL.
- Open external demo sites in a new tab with `rel="noopener noreferrer"` and a clear external-link indication.
- Do not render a demo button when no demo URL exists.
- Work on mobile and desktop.
- Gracefully handle deleted/unavailable external videos or demos.
- Do not expose admin-only/draft testimonials publicly.

## Media uploads

The owner specifically wants to upload video content from admin, not merely paste text. Implement a durable media-upload approach:
- Railway local filesystem is not reliable persistent media storage. Do not store uploaded production media only on the API server's local disk.
- Use a provider adapter for durable object/media storage, preferably Cloudinary or another practical provider with a usable free tier where available.
- Implement signed/server-authorized upload flow; never expose storage secrets in the browser.
- Allow admin to upload video and image assets, preview them, replace them and delete them.
- Validate MIME type, extension, file size and content as far as practical on both client and server.
- Reject executable/unsafe files.
- Store durable media URL and metadata in PostgreSQL, not the binary itself.
- If media-storage credentials are not configured, allow admin to add a valid YouTube/Vimeo/external video URL as a fallback and clearly show the storage integration as not configured. Do not pretend a file upload succeeded.
- Document exact provider setup and current quota/free-tier limitations. Do not promise unlimited free storage or video bandwidth.

## Portfolio upgrades

Existing portfolio items have media URL and thumbnail fields. Improve them to support:
- Title, description, service category
- Image, video or project preview
- Optional gallery if useful
- Video demo
- Separate live website URL
- Optional related contact/project URL
- Featured toggle
- Sort order
- Publish/unpublish
- Optional client/business name only where approved for public use

A portfolio demo should be clearly marked as a demo or project preview where relevant. Never invent a completed client project or claim the owner owns a project that is only a template demonstration.

## Authenticity

Existing seed data contains sample testimonials/portfolio entries and unsupported ratings/claims. Audit every seeded and published record:
- Do not display fictional testimonials, invented client names, fabricated quotes, fake ratings or false customer outcomes.
- Do not claim a demo template is a real client delivery.
- Do not publish fake case-study metrics, revenue growth, conversion rates, traffic improvements or client counts.
- Use an elegant “Work is being added” / “Testimonials coming soon” state until the owner adds genuine approved material.
- If useful sample entries remain in development, mark them unmistakably as demo data and ensure production seed does not publish them.

---

# 9. Services and service-plan admin management

Preserve the existing service and ServicePlan architecture, but repair the service taxonomy.

The current database uses combined categories such as `PHOTOGRAPHY_VIDEOGRAPHY` and `SEO_DIGITAL_MARKETING`. The public business needs eight distinct service divisions. Design a safe migration:
- Add/split categories for Photography, Videography, SEO and Digital Marketing.
- Keep Web Development, Video Editing, Graphic Design and Script & Content Writing as separate categories.
- Migrate existing plans and records to the correct new categories without losing data.
- Keep old enum values only as migration compatibility where necessary; do not leave the public site with combined categories.
- Update Zod schemas, OpenAPI spec, generated clients and all frontend forms/filters.
- Make each service independently editable and publishable.

Admin can manage:
- Service title, slug, description, long description, icon/image, order, active state, SEO metadata.
- Service plan name, description, pricing type (one-time/monthly/other if truly needed), optional indicative price label, badge, active state and sort order.
- Add/edit/delete plans.
- Reorder services and plans.
- Do not require a price to publish a plan; show “Request a quote” when no approved price exists.
- Never seed unverified prices from legacy sample seed data.

Quote form:
- Select one or multiple service divisions.
- Optionally select a specific service plan after choosing a service.
- Allow “Not sure yet / General inquiry”.
- Store selected service and plan correctly in the inquiry.
- Do not block submission if the visitor is unsure which plan they need.

---

# 10. Contact, inquiry and consultation flow

Build one excellent, low-friction contact/quote workflow. The current project already has inquiries and consultation bookings; reuse them if they are sound.

Suggested fields:
- Name
- Email
- Phone/WhatsApp (optional)
- Business/organization (optional)
- Service(s) of interest
- Optional service plan
- Project description / what the visitor needs
- Budget range (optional)
- Currency (NPR / INR / USD, optional)
- Timeline (optional)
- Preferred contact method (optional)
- Consent checkbox linking to Privacy Policy

Requirements:
- Server-side Zod validation; client validation is only for UX.
- Normalize and safely handle user input.
- Add rate limiting, request size limits, honeypot/spam controls and duplicate-submit protection.
- Persist inquiry before sending email.
- Show a clear confirmation and reference number.
- Admin can search/filter, view, update status, add private internal notes and archive/delete inquiries.
- Keep private notes and client details private from public APIs.
- Useful statuses: New, Contacted, In Discussion, Quoted, Won, Closed.
- If SMTP is unavailable, still save the inquiry and tell the visitor the request was received. Do not claim an email was sent.
- If consultation scheduling exists and is sound, retain it as an optional client convenience; do not make it a prerequisite to contact the company.
- Keep the UI friendly and easy for a non-technical business owner to manage.

---

# 11. Gmail SMTP automatic replies

The existing API has Nodemailer and email templates. Do not replace it unnecessarily; audit and repair it.

Use Gmail SMTP with a Google **App Password**, not the normal Gmail password.

Server environment variables:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465` for SSL or `587` for STARTTLS
- `SMTP_USER=company-gmail-address`
- `SMTP_PASS=google-app-password`
- `SMTP_FROM=Trivenix Partners <company-gmail-address>`
- `ADMIN_EMAIL=company-notification-address`

The existing `.env.example` contains `trivinexpartners@gmail.com` as the intended example sender. Preserve it only as a configurable example/default if the owner confirms it is the intended mailbox; do not hard-code it into application logic or assume it is verified.

Required behavior:
1. Configure Nodemailer correctly for the selected port.
2. Remove unsafe TLS configuration such as `rejectUnauthorized: false`.
3. Add connection verification and an admin-only test-email action.
4. On a valid client inquiry, persist first, then send an admin notification and a visitor acknowledgement.
5. Use branded HTML and plain-text email alternatives.
6. Escape all user-controlled content in HTML templates.
7. Include inquiry reference and useful summary without internal notes.
8. Avoid false promises about response times unless configured by the owner. Do not hard-code “we reply within 24–48 hours” unless confirmed.
9. Track email delivery attempt/status against the inquiry or a related email log.
10. Use safe error handling and limited retry/idempotency so repeated requests do not send duplicate acknowledgements.
11. If email fails, do not lose the inquiry. Log a sanitized error without credentials, full message content or secrets.
12. Do not expose SMTP password or provider diagnostics in the frontend or admin API.
13. Email status in admin must reflect actual configuration/test results.

Provide clear setup steps:
- Enable Google 2-Step Verification.
- Generate an App Password if the Google account supports it.
- Put it in Railway/server environment variables.
- Restart/redeploy the API.
- Use the admin test-email action.

Gmail quotas and Google policies apply. Do not claim the integration is unlimited, permanently free or guaranteed to work without account setup. The site must remain usable when SMTP is not configured.

---

# 12. Google Gemini AI company assistant

Add a small, polished, optional website assistant that answers visitor questions about Trivenix Partners and the page/service currently being viewed.

Use the official supported Google Gemini API/SDK through the backend. Check current SDK/model support at implementation time. Make the model configurable; do not hard-code an obsolete model.

Server-only environment variables:
- `GEMINI_API_KEY=...`
- `GEMINI_MODEL=...`

Never expose the API key through Vite environment variables, frontend bundles, browser requests, public settings or logs.

The assistant may answer from approved public knowledge about:
- Company identity and current operating model
- Mission, vision and values
- All eight service divisions and their plans
- How a client works with Trivenix
- Pricing philosophy and supported quote currencies
- Revision/scope/timeline/refund principles
- Privacy policy and client service terms
- Published FAQs
- Contact options
- Current public page/service context

Knowledge architecture:
- Build a curated public knowledge context from published service records, service plans, FAQs, public site content, public policies and contact settings.
- The knowledge must reflect admin edits without requiring a code deployment.
- Do not feed the raw company report wholesale to the public model. It contains internal recruitment, compensation, professional management, commission, applicant and operational details.
- Never expose applicant/employee records, internal notes, private inquiries, unpublished testimonials, payment/payout details, credentials, hidden admin routes, database dumps or internal company-only policies.
- Only include content explicitly marked public/published/approved.

Assistant behavior:
- It represents Trivenix Partners, but it must be transparent that it is AI.
- Answer clearly and naturally using simple language.
- Never invent services, prices, office locations, legal status, guaranteed results, client testimonials or response times.
- Do not guarantee SEO rankings, revenue, leads, audience growth or business outcomes.
- If the knowledge base does not contain an answer, say so and direct the visitor to contact the company for confirmation.
- For project-specific quotes, explain that price depends on scope and invite the visitor to submit an inquiry.
- Resist prompt injection: visitor text cannot override system rules, reveal hidden instructions or request private information.
- Informational only. Do not send email, submit inquiries, edit records, perform admin actions or make bookings on behalf of visitors.
- Limit input length, output length, request rate and token usage.
- Add rate limiting and abuse controls.
- Handle quota, model and network failures gracefully with a fallback to FAQs and contact links.
- Do not promise free unlimited Gemini access. Free-tier quotas, regions and model availability may change.
- Chat UI must be accessible, dismissible, mobile-friendly and unobtrusive. Do not auto-open on page load.

---

# 13. Privacy policy and service terms

The current site has a Privacy Policy page but needs an accurate rewrite. Add a client-facing Service Terms / Terms page.

## Privacy Policy

Write plain-language, honest policy content that matches the actual implementation:
- What inquiry/contact information is collected
- Purpose of collection and use
- Email acknowledgements and admin notifications
- AI assistant use and disclosure that messages may be processed by Google's Gemini API when enabled
- Hosting, database, email and media-storage service providers actually configured
- Security logs and abuse-prevention data
- Cookies/session storage only if actually used
- Data access controls
- Retention principles
- User requests to access/correct/delete information and how to contact the company
- International processing where relevant
- Policy last-updated date

Do not say “we never share data” when service providers process data. Do not claim payment data is collected if no payment processing occurs on the site. Do not mention applicant data collection after recruitment forms are removed. Do not claim certifications or legal compliance that are not verified.

The company report describes data minimization, purpose limitation, access control, security and non-indefinite retention. Reflect those principles. It also calls the retention framework proposed/operational and says a formal legal/privacy framework should be established separately. Do not present proposed internal retention periods as legally certified policy.

## Service Terms

Explain:
- Project scope and written agreement
- Quotes, indicative pricing and currency
- Payment schedule as agreed
- Delivery timelines and client dependencies
- Reasonable revisions (approximately 5–6 only where applicable to the agreed service/package)
- Scope changes and additional charges
- Client-provided materials and accuracy
- Confidentiality
- Portfolio use only with appropriate permission
- Refund/cancellation framework based on stage, work completed, expenses and agreement
- Final work ownership after full payment, subject to agreement and third-party licensing
- Source/editable files only when included in the agreement
- No guaranteed SEO rankings or commercial outcomes
- Good-faith negotiation as the first dispute-resolution step
- Contact details for questions

Do not invent a registered legal entity, company registration number, legal jurisdiction, court or formal legal guarantee. The report says formal legal arrangements should be established separately when the company becomes registered, with Nepal as the intended future legal framework. State that the site information is general and individual written project agreements govern each engagement subject to applicable law. Mark the pages for owner/legal review before launch.

---

# 14. Admin dashboard and secure authentication

Keep a private admin-only dashboard. There must be no public sign-up route.

Admin sections should be practical and consistent:
- Dashboard / overview
- Inquiries
- Consultations / meeting bookings if retained
- Projects (internal only, if the existing system is functional)
- Services
- Service Plans
- Portfolio
- Testimonials
- FAQs / AI public knowledge
- Website content and homepage sections
- Contact/social settings
- SEO settings
- Email and AI integration status/test controls
- Audit log
- Admin account/security settings

All CRUD must be real and persistent:
- Create, list, edit, delete with confirmation
- Publish/unpublish
- Sort/reorder
- Validation
- Loading/empty/error/success states
- Database persistence after refresh
- No inert buttons or fake local-only saves

## Critical existing security defects to fix

The existing project uses:
- `ADMIN_ACCESS_KEY`
- `VITE_ADMIN_KEY`
- `/admin/login?key=...`
- A frontend `AdminKeyGuard`
- A default seeded admin email/password in the seed script and docs

Remove this design entirely:
- No admin secret in any `VITE_` variable.
- No secret in URL query strings.
- No default predictable admin credentials.
- No public admin key.
- Do not allow admin access just because an environment variable is absent.
- Never rely on a frontend route guard as security.

Use a secure server-side admin authentication system:
- Admin password hashed with bcrypt/Argon2.
- Secure HTTP-only session cookie.
- `Secure` in production, appropriate `SameSite`, expiration and session rotation.
- CSRF protection for cookie-authenticated state-changing requests.
- Server-side authorization middleware on every admin route.
- Login rate limiting.
- Safe logout that destroys/invalidate session.
- Generic auth failure messages.
- Secure first-admin bootstrap through a server-only environment variable or one-time setup process disabled after initialization.
- No public admin registration.
- No employee role login if the employee portal is removed.
- Password reset must be a safe documented owner-controlled procedure; do not add an insecure public reset endpoint.

The current project already uses PostgreSQL-backed Express sessions. Preserve this if it is correctly configured. Verify `trust proxy`, cookie settings and session store behavior behind Railway. Check whether `SameSite=strict` breaks the actual Vercel frontend/Railway API cross-site session flow; choose the correct secure cookie/CORS/CSRF setup for the deployed topology rather than blindly keeping or changing it.

Also implement:
- Strict CORS for configured production frontend origins
- Helmet/security headers
- Rate limits for login, inquiry, AI and upload endpoints
- Request size limits
- Safe error responses (no stack/SQL/env leaks)
- Parameterized ORM queries
- XSS-safe rendering and email templates
- Safe external URL validation and embed allowlists
- No secrets in logs or audit records
- No credentials in browser storage
- Admin-only access to private records and unpublished content

---

# 15. Database, API and data migrations

Preserve the existing PostgreSQL + Drizzle stack. Do not replace it with Firebase, Supabase, Prisma or a different database without a compelling technical reason.

Perform a careful schema and API audit:
- Check all foreign keys, enum values, nullability, indexes, timestamps and cascade behavior.
- Add testimonial video fields and separate demo URL.
- Add portfolio live demo URL and any necessary media metadata.
- Add publication state, captions/alt text and sort order where required.
- Split combined service categories safely.
- Preserve service plan associations and inquiry selections.
- Track inquiry email status/delivery attempts safely.
- Add AI public-knowledge publication controls if needed.
- Ensure only published public content is returned by public APIs.
- Ensure admin endpoints require authenticated admin role.
- Add pagination or safe maximum result limits.
- Use transactions for multi-step operations.
- Use idempotent seed scripts.
- Do not reset or drop production data.
- Do not seed fake testimonials or portfolio work.
- Do not seed unsupported prices.
- Do not seed a default password.

The existing OpenAPI file `lib/api-spec/openapi.yaml` is the source of truth. Update it, then run the codegen script for `lib/api-zod` and `lib/api-client-react`. Verify generated types/hooks match the real API. Do not edit generated files as the only change.

Keep data migrations safe and additive where possible. If removing applicant/interview tables, first inspect existing data and dependencies; archive or leave unused historical tables where dropping them would risk data loss. Remove dead code/routes safely without destructive database resets.

---

# 16. Repository cleanup — make it lean without breaking deployment

The user wants the final repository cleaned of unnecessary files and old project identity. Make a deliberate cleanup.

Likely removals after reference checks:
- `artifacts/mockup-sandbox/` and its dependencies/config if not used by the production site.
- Old Craftloop/Craft Loop references, assets and package identity.
- Obsolete Careers/Freelancers/Applicants/Interview UI and related public email templates/routes.
- Candidate interview booking routes/slots if no longer used.
- Unused scripts, mockups, generated artifacts and screenshots not used by production.
- `package-lock.json` (pnpm project; keep `pnpm-lock.yaml`).
- Outdated `replit.md` if it documents old branding, unsafe admin credentials or obsolete workflows. Replace it with concise accurate setup documentation only if it is still useful.
- Remove the old default admin seed password and all docs that expose it.
- Remove unused dependencies only after confirming no remaining imports use them.
- Remove unused attached assets only after checking imports and design relevance.

Do NOT blindly delete:
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- package manifests
- `.gitignore`
- `.npmrc` if needed by pnpm
- TypeScript/Vite/Tailwind/build configuration
- `lib/api-spec` or generated packages required by the app
- database schema/migrations
- `railway.toml`, `railpack.json`, `Procfile`, `vercel.json` if part of deployment
- `attached_assets` images/fonts used by the finished site
- tests or useful scripts

The user mentioned README and similar files. This archive does not appear to have a conventional README; it has an outdated `replit.md`. Remove or rewrite obsolete docs rather than deleting essential project/deployment information. Leave one concise, accurate deployment/setup guide if needed.

Update `@workspace/craftloop` package name and all workspace references to a consistent Trivenix Partners package name if safe. Keep workspace dependency links and build commands working. Do not rename source directories if doing so would create unnecessary risk; package identity and visible branding matter more than cosmetic path renaming.

---

# 17. SEO, accessibility, performance and quality

## SEO
- Unique page title and meta description.
- Canonical URL from one configurable production base URL.
- Open Graph/social metadata.
- Correct sitemap and robots.txt.
- Organization/WebSite/Service/Breadcrumb schema where accurate.
- FAQ structured data only when visible content qualifies.
- No fake review/rating schema.
- Descriptive headings, image alt text and internal links.
- Do not index admin/login routes, private content or draft data.

## Accessibility
- Semantic HTML and landmarks.
- Keyboard navigation and visible focus.
- Correct form labels/errors.
- Adequate color contrast.
- Accessible dialogs, mobile navigation, video controls and chat.
- Reduced-motion support.
- Screen-reader-friendly status feedback.
- Do not communicate state only through color.

## Performance
- Optimize images and dimensions.
- Lazy-load below-the-fold imagery and video.
- Do not load video payloads until needed.
- Code-split admin/heavy pages.
- Remove unused packages and dead code.
- Avoid layout shift and oversized animation bundles.
- Optimize for ordinary Android devices and limited bandwidth.
- Configure caching sensibly.

---

# 18. Deployment topology and environment setup

Keep the current Vercel frontend + Railway API + Neon/PostgreSQL architecture if it works correctly. It is already reflected in the repo. Do not migrate hosting unnecessarily.

Check and fix:
- Vercel root/build/output settings
- Railway build/start commands
- pnpm workspace build
- API health endpoint
- Frontend API base URL/rewrite/proxy
- CORS origins
- Production session cookie behavior behind reverse proxy
- PostgreSQL connection pooling
- SPA route fallback
- Node runtime compatibility
- Static asset paths and caching

Create a clean `.env.example` with names and safe placeholders only. It should cover as applicable:
- `DATABASE_URL`
- `SESSION_SECRET`
- Secure first-admin bootstrap variables
- `ALLOWED_ORIGINS`
- `PUBLIC_SITE_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`
- `GEMINI_API_KEY`, `GEMINI_MODEL`
- Media provider credentials (only if integrated)

Do not include actual secrets. Never put private server variables in `VITE_` environment variables.

Document exact steps for:
1. Install dependencies using pnpm.
2. Configure Neon/PostgreSQL.
3. Apply Drizzle schema/migrations safely.
4. Configure secure initial admin and session secret.
5. Deploy API to Railway.
6. Set frontend/API environment variables and deploy to Vercel.
7. Configure Gmail App Password in Railway.
8. Configure Gemini API key/model in Railway.
9. Configure persistent media storage if uploads are enabled.
10. Verify the production domain, forms, admin, email, AI and media.

If a provider requires the owner to create an account or enter a credential, implement the code path and state the exact required setup. Never fabricate a successful integration test.

---

# 19. Execution and testing requirements

Work in the actual extracted repository. Keep the app buildable as you work. Do not stop after writing a checklist.

At minimum:
- Inspect all package manifests and scripts.
- Inspect every public route and all admin routes.
- Inspect the database schema and seed script.
- Inspect auth/session/email logic.
- Inspect all old-brand references.
- Inspect all public employment/recruitment references.
- Inspect the current design and existing useful assets.
- Make an implementation checklist privately, then execute it.
- Update database schema and API contracts.
- Run code generation.
- Update frontend and backend.
- Remove unused files/dependencies after verifying references.

Run available checks and fix issues:
- `pnpm install --frozen-lockfile` after lockfile updates, or the appropriate clean install command.
- Workspace TypeScript checks.
- Frontend production build.
- API production build.
- Database schema/migration validation.
- Lint/tests if configured.
- Add focused tests for security-sensitive and business-critical flows if missing.

Acceptance checks:

### Public
- All public pages load directly and refresh correctly.
- Navigation and mobile menu work.
- All eight service divisions display separately and accurately.
- Service plans load and are editable.
- Quote form can select one/multiple services and optional plan.
- Inquiry is saved and confirmation is truthful.
- Consultation booking works if retained.
- Portfolio filters and demo links work.
- Video testimonials play on mobile and desktop.
- Live demo link is distinct and opens safely.
- Privacy Policy and Terms reflect actual implementation.
- AI assistant answers from published approved company content and handles unknowns gracefully.
- No client login/signup exists.
- No public Careers/Freelancer/Applicant/Employee portal exists.
- No fake testimonials, fake portfolio results or fabricated company statistics appear.

### Admin
- Unauthenticated users cannot access admin routes or API.
- Admin login works without query-string secrets or frontend key.
- Logout invalidates the session.
- Service CRUD works.
- Service-plan CRUD works.
- Portfolio CRUD works.
- Testimonial CRUD works.
- Video upload works when storage is configured; external video URL fallback works.
- Live demo URL can be add/edit/delete and validated.
- Publish/unpublish and ordering persist.
- FAQ and public AI knowledge edits are reflected in assistant answers.
- Inquiry list/status/notes work.
- Email test reports actual result.
- Integration status does not expose secrets.

### Email
- Inquiry persists when SMTP fails.
- Admin notification and client acknowledgement work when configured.
- HTML and plain-text emails are valid.
- User input is escaped.
- Duplicate submissions do not cause duplicate emails.
- SMTP errors are logged safely.

### Security
- No API key/password in frontend bundle.
- No secrets committed.
- Admin APIs enforce server-side authentication and role checks.
- Rate limits work.
- CORS is restrictive.
- Production cookies are secure and compatible with the deployment topology.
- Public endpoints never expose drafts, internal notes or private records.

### Quality
- No TypeScript errors.
- No failed production builds.
- No missing assets or broken imports.
- No old Craft Loop identity.
- No dead navigation links.
- No obvious console errors.
- No mobile horizontal overflow.
- No fake loading, fake upload progress or false email success.

If an external credential is not available, mark that test **NOT VERIFIED — owner setup required**. Do not claim success.

---

# 20. Final output expected from you

When the implementation is complete, provide a concise but specific report:
1. What you changed and why.
2. Final website routes/features.
3. What was kept, removed and migrated.
4. Database migrations and API/codegen changes.
5. Security fixes.
6. Required environment variables (names only, no secrets).
7. Gmail App Password setup.
8. Gemini API setup.
9. Media-storage setup.
10. Exact local install/typecheck/build/run commands.
11. Exact Vercel/Railway deployment steps.
12. Tests actually run and their real results: PASS / FAIL / NOT VERIFIED.
13. Any remaining action the owner must perform.

Do not merely tell the owner what should be done. Implement the project, run the checks, fix failures and report honestly.

## Definition of done

A polished, coherent, responsive Trivenix Partners client website using the existing codebase; eight distinct service divisions and editable service plans; genuine portfolio and video testimonials with separate live demo links; secure private admin CMS; working inquiry and consultation flow; Gmail SMTP automatic acknowledgement; a Gemini assistant grounded only in approved public company knowledge; accurate About, Privacy and Service Terms content; no public employment or client registration portal; no fake testimonials/prices/metrics; no old Craft Loop branding; and a clean repository that still installs, builds and deploys through the existing pnpm + Vercel + Railway + PostgreSQL architecture.
