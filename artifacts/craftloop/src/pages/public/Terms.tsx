import { SEOHead } from "@/components/SEOHead";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <SEOHead
        title="Service Terms — Trivenix Partners"
        description="Client service terms and policies for Trivenix Partners. Quotes, payments, revisions, refunds, confidentiality, and dispute resolution."
        canonical="/terms"
      />

      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">TRIVINEX</span>
              <span className="font-bold text-xl tracking-tight text-blue-600">PARTNERS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</Link>
              <Link href="/services" className="text-sm font-medium text-slate-600 hover:text-slate-900">Services</Link>
              <Link href="/privacy-policy" className="text-sm font-medium text-slate-600 hover:text-slate-900">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 lg:px-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Service Terms</h1>
          <p className="text-slate-600 leading-relaxed">
            These terms govern the client relationship with Trivenix Partners. They are presented
            for transparency and should be reviewed before submitting an inquiry. Individual written
            project agreements govern each engagement.
          </p>
        </header>

        <article className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p>
              Trivenix Partners is a founder-led, fully online digital services company. We help
              businesses access multiple digital and creative services through one managed company
              relationship — coordinating suitable remote professionals and reviewing work before
              delivery. You hire Trivenix Partners, not an individual freelancer.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              We operate remotely with no permanent physical office. Our current operational focus
              can include Nepal and India, and we accept international inquiries where the service can
              reasonably be delivered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Work</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us through the website or configured official contact channels.</li>
              <li>We discuss your needs, goals, timeline, budget, and technical requirements.</li>
              <li>We recommend an appropriate service or plan.</li>
              <li>We provide a quotation based on your actual project.</li>
              <li>We agree on scope, price, timeline, and terms in a written agreement.</li>
              <li>We assign an appropriate professional from our distributed network.</li>
              <li>Production is completed remotely. We review quality before delivery.</li>
              <li>We coordinate reasonable revisions and deliver approved work.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Pricing and Quotes</h2>
            <p>
              Final pricing depends on service type and complexity, number of deliverables, project
              duration, professional expertise, revisions, urgency, required equipment, and scope.
              We may quote in NPR, INR, or USD; the currency and payment method are agreed during
              the individual client agreement. We do not publish a universal price list, and no price
              shown on this site is a guaranteed quote.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Revisions and Scope</h2>
            <p>
              Standard projects may include approximately 5&ndash;6 reasonable revision rounds,
              depending on the service and the written agreement. Revisions normally relate to the
              original agreed scope. New requirements or major scope changes may require a revised
              quote and timeline.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Client-Provided Materials</h2>
            <p>
              You are responsible for the accuracy and lawful use of any materials, information, or
              access you supply. If you delay required information or approvals, deadlines may be
              extended and extra costs may apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Confidentiality and Portfolio Use</h2>
            <p>
              Confidential client work is not displayed publicly without your permission. We may use
              completed work for portfolio or case studies only with appropriate client permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Refunds and Cancellation</h2>
            <p>
              Refund decisions depend on the service type, project stage, completed work,
              cancellation timing, professional or third-party expenses, payment status, and the
              project agreement. A full refund is not automatic after substantial work has been
              completed. If you cancel after work begins, we may retain an appropriate amount for
              completed work, professional payments, and expenses; any remaining refund is determined
              by the agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Ownership and Deliverables</h2>
            <p>
              Client work belongs to the client after applicable full payment, subject to the project
              agreement and any third-party licensing. Source or editable files are transferred only
              where included in the project agreement and after full payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. No Guaranteed Outcomes</h2>
            <p>
              We do not guarantee SEO rankings, leads, sales, revenue, audience growth, or any
              specific business outcome. Project-specific written agreements govern each engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Disputes</h2>
            <p>
              Disputes should first be addressed through good-faith discussion and negotiation.
              Contact us using the details on our website if you have a concern.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">11. Important Notices</h2>
            <p>
              This website and its content are provided for general information only. Trivenix
              Partners is not yet a formally registered legal entity; formal legal arrangements are
              expected to be established separately as the company grows. These terms are not legal
              advice and do not create a registered legal entity, company registration number, or
              formal legal jurisdiction. Individual written project agreements govern each
              engagement subject to applicable law.
            </p>
            <p className="text-slate-500 text-sm">
              These pages should be reviewed by the owner and, where appropriate, legal counsel
              before launch.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">12. Contact</h2>
            <p>
              Questions about these terms or our services? Contact us through the website or our
              configured official contact channels.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
