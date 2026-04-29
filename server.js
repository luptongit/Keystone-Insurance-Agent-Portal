// Keystone — agent portal demo
// Express + EJS server

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- View engine -----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ----- Static assets -----
app.use(express.static(path.join(__dirname, 'public')));

// ----- Shared view data -----
// Every page render gets these via res.locals.
// `currentPath` powers active-state highlighting in the sidebar partial.
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.user = {
    initials: 'MC',
    name: 'Maya Chen',
    role: 'Producer · Harborlight',
  };
  next();
});

// ----- Routes -----

// Login is its own standalone view (no app shell)
app.get('/login', (req, res) => {
  res.render('pages/login', { layout: false });
});

// Home / dashboard
app.get('/', (req, res) => {
  res.render('pages/dashboard', {
    pageTitle: 'Home',
    activeNav: 'home',
  });
});

// Customer 360 — currently a single hardcoded household
app.get('/customers', (req, res) => {
  // For now, redirect straight to the demo household
  res.redirect('/customers/ramirez-household');
});

app.get('/customers/:customerId', (req, res) => {
  res.render('pages/customer-360', {
    pageTitle: 'Customer 360',
    activeNav: 'customers',
    customerId: req.params.customerId,
  });
});

// Quote flow
app.get('/quote/new', (req, res) => {
  res.render('pages/quote-flow', {
    pageTitle: 'New quote',
    activeNav: 'quote',
  });
});

// Agent 360
app.get('/agent-360', (req, res) => {
  res.render('pages/agent-360', {
    pageTitle: 'Agent 360',
    activeNav: 'agent360',
  });
});

// Sales pipeline
app.get('/sales-pipeline', (req, res) => {
  res.render('pages/sales-pipeline', {
    pageTitle: 'Sales pipeline',
    activeNav: 'pipeline',
    pageCSS: 'sales-pipeline',
  });
});

// Renewals
app.get('/renewals', (req, res) => {
  res.render('pages/renewals', {
    pageTitle: 'Renewals',
    activeNav: 'renewals',
    pageCSS: 'renewals',
  });
});

// Platform map (the marketing-style overview)
app.get('/platform-map', (req, res) => {
  res.render('pages/platform-map', { layout: false });
});

// ----- Placeholder pages for nav items not yet built -----
// These render a friendly "coming soon" so navigation never breaks.
const placeholderRoutes = [
  { path: '/book-of-business', label: 'Book of business', activeNav: 'book' },
  { path: '/leads', label: 'Leads', activeNav: 'leads' },
  { path: '/policies', label: 'Policies', activeNav: 'policies' },
  { path: '/endorsements', label: 'Endorsements', activeNav: 'endorsements' },
  { path: '/claims', label: 'Claims (FNOL)', activeNav: 'claims' },
  { path: '/billing', label: 'Billing', activeNav: 'billing' },
  { path: '/marketing-studio', label: 'Marketing studio', activeNav: 'marketing' },
  { path: '/commissions', label: 'Commissions', activeNav: 'commissions' },
  { path: '/knowledge-base', label: 'Knowledge base', activeNav: 'knowledge' },
  { path: '/training', label: 'Training & licensing', activeNav: 'training' },
  { path: '/underwriting-hub', label: 'Underwriting hub', activeNav: 'underwriting' },
];

placeholderRoutes.forEach(({ path: routePath, label, activeNav }) => {
  app.get(routePath, (req, res) => {
    res.render('pages/coming-soon', {
      pageTitle: label,
      activeNav,
      label,
    });
  });
});

// ----- 404 -----
app.use((req, res) => {
  res.status(404).render('pages/coming-soon', {
    pageTitle: 'Not found',
    activeNav: '',
    label: 'Page not found',
    notFound: true,
  });
});

// ----- Start -----
app.listen(PORT, () => {
  console.log(`Keystone running on http://localhost:${PORT}`);
});
