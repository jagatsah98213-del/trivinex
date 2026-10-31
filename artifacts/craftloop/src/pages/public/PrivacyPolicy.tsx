import { motion } from "framer-motion";
import { Link } from "wouter";
import { SEOHead, SITE_URL } from "@/components/SEOHead";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as any },
};

const LAST_UPDATED = "October 31, 2026";

const PRIVACY_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/privacy-policy`,
  "url": `${SITE_URL}/privacy-policy`,
  "name": "Privacy Policy | Trivenix Partners",
  "description": "Privacy Policy for Trivenix Partners — how we collect, use, and protect your personal information.",
  "isPartOf": { "@id": `${SITE_URL}/#website` },
  "dateModified": "2026-10-31",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section {...fadeUp} className="mb-12">
      <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mb-4">{title}</h2>
      <div className="space-y-4 text-[#6E6E73] text-base leading-relaxed">{children}</div>
    </motion.section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col overflow-hidden">
      <SEOHead
        title="Privacy Policy — Trivenix Partners"
        description="Read Trivenix Partners' Privacy Policy to understand how we collect, use, and protect your personal information."
        canonical="/privacy-policy"
        jsonLd={PRIVACY_JSONLD}
        noIndex={false}
      />

      <section className="relative bg-[#06060A] pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10 text-center">
          <motion.h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-white mb-4">
            Privacy Policy
          </motion.h1>
          <motion.p className="text-[#8E8E9A] text-lg max-w-xl mx-auto">
            Last updated: {LAST_UPDATED}. This policy explains how Trivenix Partners collects,
            uses, and protects your personal information.
          </motion.p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-12 lg:px-8">
        <Section title="1. Who We Are">
          <p>
            Trivenix Partners is a founder-led, fully online digital services company. We help
            businesses access web development, video editing, graphic design, photography,
            videography, script & content writing, SEO, and digital marketing through one managed
            company relationship.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            When you submit an inquiry or consultation request through our website, we collect:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#6E6E73]">
            <li>Your name and email address</li>
            <li>Phone number (optional)</li>
            <li>Business or organization name (optional)</li>
            <li>Service(s) of interest and project description</li>
            <li>Budget range, timeline, and preferred contact method (optional)</li>
          </ul>
          <p>
            We do not collect payment information on this website — no payments are processed here.
            We do not operate a public client signup or login, so no client account data is stored.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>
            We use the information you provide to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#6E6E73]">
            <li>Respond to your inquiry and provide a quotation</li>
            <li>Coordinate consultations and project discussions</li>
            <li>Send you an email acknowledgement that your request was received</li>
            <li>Notify our team of new inquiries so we can follow up</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
        </Section>

        <Section title="4. AI Assistant">
          <p>
            Our website may offer an AI assistant that answers questions about Trivenix Partners and
            the services we offer. When enabled, your messages may be processed by Google's Gemini
            API to generate replies. The assistant only has access to approved public company
            information — it does not see your private inquiry details, internal notes, or any
            non-public data.
          </p>
          <p>
            Do not share sensitive or confidential information with the AI assistant. If you need to
            discuss a specific project, please submit an inquiry instead.
          </p>
        </Section>

        <Section title="5. Service Providers">
          <p>
            We use third-party service providers to operate the website. Depending on what is
            configured, these may include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#6E6E73]">
            <li><strong>Neon / PostgreSQL</strong> — database hosting for inquiry and application data</li>
            <li><strong>Railway</strong> — API server hosting</li>
            <li><strong>Vercel</strong> — frontend hosting</li>
            <li><strong>Gmail SMTP</strong> — sending inquiry acknowledgements and admin notifications</li>
            <li><strong>Google Gemini</strong> — AI assistant (when enabled)</li>
            <li><strong>Cloudinary</strong> — media storage for portfolio and testimonial assets (when enabled)</li>
          </ul>
          <p>
            These providers may process your data on our behalf. We do not share your personal
            information with unaffiliated third parties for their own marketing purposes.
          </p>
        </Section>

        <Section title="6. Cookies and Sessions">
          <p>
            We use a secure, HTTP-only session cookie for admin authentication only. Public visitors
            do not receive tracking cookies or analytics cookies from us. No client account sessions
            exist because there is no public client signup or login.
          </p>
        </Section>

        <Section title="7. Data Access and Retention">
          <p>
            Access to inquiry data is limited to authorized Trivenix Partners staff. We retain
            inquiry records as needed to manage client relationships and project delivery. We do not
            retain data indefinitely beyond what is necessary for legitimate business purposes.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>
            You may request to access, correct, or delete your personal information by contacting us
            through the details on our website. We will respond to legitimate requests in a timely
            manner.
          </p>
        </Section>

        <Section title="9. International Processing">
          <p>
            Our distributed team and service providers may operate in multiple countries, including
            Nepal and India. By submitting information to us, you consent to processing in the
            countries where we and our providers operate.
          </p>
        </Section>

        <Section title="10. Security">
          <p>
            We use industry-standard measures to protect your information, including encrypted
            connections (TLS), secure session cookies, and server-side access controls. No method of
            transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>
            Our services are not directed to children under 13. We do not knowingly collect personal
            information from children under 13.
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this privacy policy from time to time. The "last updated" date at the top
            of this page reflects the most recent revision. We encourage you to review this page
            periodically.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            Questions about this privacy policy or our data practices? Contact us through the
            contact information on our website.
          </p>
        </Section>

        <div className="pt-12 border-t border-[#E8E8ED] text-xs text-[#6E6E73]">
          <p>
            This privacy policy is general information and is not legal advice. Trivenix Partners is
            not yet a formally registered legal entity. Formal legal arrangements are expected to be
            established separately as the company grows.
          </p>
        </div>
      </main>
    </div>
  );
}
