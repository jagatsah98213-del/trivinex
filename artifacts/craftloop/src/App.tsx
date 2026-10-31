import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';

import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import Home from '@/pages/public/Home';
import Services from '@/pages/public/Services';
import ServiceDetail from '@/pages/public/ServiceDetail';
import Portfolio from '@/pages/public/Portfolio';
import About from '@/pages/public/About';
import Quote from '@/pages/public/Quote';
import Consultation from '@/pages/public/Consultation';
import Testimonials from '@/pages/public/Testimonials';
import PrivacyPolicy from '@/pages/public/PrivacyPolicy';
import Terms from '@/pages/public/Terms';

import Login from '@/pages/auth/Login';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminInquiries from '@/pages/admin/Inquiries';
import AdminConsultations from '@/pages/admin/Consultations';
import AdminProjects from '@/pages/admin/Projects';
import AdminServices from '@/pages/admin/Services';
import AdminServicePlans from '@/pages/admin/ServicePlans';
import AdminPortfolio from '@/pages/admin/Portfolio';
import AdminTestimonials from '@/pages/admin/Testimonials';
import AdminSiteContent from '@/pages/admin/SiteContent';
import AdminAuditLog from '@/pages/admin/AuditLog';
import AdminSettings from '@/pages/admin/Settings';

const queryClient = new QueryClient();

// Scroll positions keyed by path — shared across renders via module scope
const savedScrollPositions = new Map<string, number>();

function ScrollManager() {
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const isPopNavigation = useRef(false);

  const saveCurrentScrollPosition = () => {
    savedScrollPositions.set(prevLocation.current, window.scrollY);
  };

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const onPopState = () => {
      saveCurrentScrollPosition();
      isPopNavigation.current = true;
    };
    const onInternalLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.search === window.location.search) return;
      saveCurrentScrollPosition();
    };
    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', onInternalLinkClick, true);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', onInternalLinkClick, true);
    };
  }, []);

  useEffect(() => {
    if (location === prevLocation.current) return;

    if (!isPopNavigation.current) {
      savedScrollPositions.set(prevLocation.current, window.scrollY);
    }

    prevLocation.current = location;

    if (isPopNavigation.current) {
      isPopNavigation.current = false;
      const saved = savedScrollPositions.get(location) ?? 0;
      const restore = () => window.scrollTo({ top: saved, left: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        restore();
        requestAnimationFrame(restore);
        window.setTimeout(restore, 120);
      });
    } else {
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      );
    }
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* ── Public ── */}
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/services" component={() => <PublicLayout><Services /></PublicLayout>} />
      <Route path="/services/:slug" component={() => <PublicLayout><ServiceDetail /></PublicLayout>} />
      <Route path="/portfolio" component={() => <PublicLayout><Portfolio /></PublicLayout>} />
      <Route path="/about" component={() => <PublicLayout><About /></PublicLayout>} />
      <Route path="/quote" component={() => <PublicLayout><Quote /></PublicLayout>} />
      <Route path="/consultation" component={() => <PublicLayout><Consultation /></PublicLayout>} />
      <Route path="/testimonials" component={() => <PublicLayout><Testimonials /></PublicLayout>} />
      <Route path="/privacy-policy" component={() => <PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/terms" component={() => <PublicLayout><Terms /></PublicLayout>} />

      {/* ── Admin login ── */}
      <Route path="/admin/login" component={() => <Login type="admin" />} />

      {/* ── Admin portal ── */}
      <Route path="/admin" component={() => <AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/inquiries" component={() => <AdminLayout><AdminInquiries /></AdminLayout>} />
      <Route path="/admin/consultations" component={() => <AdminLayout><AdminConsultations /></AdminLayout>} />
      <Route path="/admin/projects" component={() => <AdminLayout><AdminProjects /></AdminLayout>} />
      <Route path="/admin/services" component={() => <AdminLayout><AdminServices /></AdminLayout>} />
      <Route path="/admin/service-plans" component={() => <AdminLayout><AdminServicePlans /></AdminLayout>} />
      <Route path="/admin/portfolio" component={() => <AdminLayout><AdminPortfolio /></AdminLayout>} />
      <Route path="/admin/testimonials" component={() => <AdminLayout><AdminTestimonials /></AdminLayout>} />
      <Route path="/admin/site-content" component={() => <AdminLayout><AdminSiteContent /></AdminLayout>} />
      <Route path="/admin/settings" component={() => <AdminLayout><AdminSettings /></AdminLayout>} />
      <Route path="/admin/audit-log" component={() => <AdminLayout><AdminAuditLog /></AdminLayout>} />

      {/* ── 404 — redirects to home ── */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ScrollManager />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
