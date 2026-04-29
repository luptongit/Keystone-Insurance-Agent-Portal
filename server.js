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

// Customers list
app.get('/customers', (req, res) => {
  res.render('pages/customers', {
    pageTitle: 'Customers',
    activeNav: 'customers',
    pageCSS: 'customers',
  });
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

// Book of business
app.get('/book-of-business', (req, res) => {
  res.render('pages/book-of-business', {
    pageTitle: 'Book of business',
    activeNav: 'book',
    pageCSS: 'book-of-business',
  });
});

// Leads
app.get('/leads', (req, res) => {
  res.render('pages/leads', {
    pageTitle: 'Leads',
    activeNav: 'leads',
    pageCSS: 'leads',
  });
});

// Policies
app.get('/policies', (req, res) => {
  res.render('pages/policies', {
    pageTitle: 'Policies',
    activeNav: 'policies',
    pageCSS: 'policies',
  });
});

// Endorsements
app.get('/endorsements', (req, res) => {
  res.render('pages/endorsements', {
    pageTitle: 'Endorsements',
    activeNav: 'endorsements',
    pageCSS: 'endorsements',
  });
});

// Claims (FNOL)
app.get('/claims', (req, res) => {
  res.render('pages/claims', {
    pageTitle: 'Claims (FNOL)',
    activeNav: 'claims',
    pageCSS: 'claims',
  });
});

// Billing
app.get('/billing', (req, res) => {
  res.render('pages/billing', {
    pageTitle: 'Billing',
    activeNav: 'billing',
    pageCSS: 'billing',
  });
});

// Marketing studio
app.get('/marketing-studio', (req, res) => {
  res.render('pages/marketing-studio', {
    pageTitle: 'Marketing studio',
    activeNav: 'marketing',
    pageCSS: 'marketing-studio',
  });
});

// Commissions
app.get('/commissions', (req, res) => {
  res.render('pages/commissions', {
    pageTitle: 'Commissions',
    activeNav: 'commissions',
    pageCSS: 'commissions',
  });
});

// Knowledge base
app.get('/knowledge-base', (req, res) => {
  res.render('pages/knowledge-base', {
    pageTitle: 'Knowledge base',
    activeNav: 'knowledge',
    pageCSS: 'knowledge-base',
  });
});

// Training & licensing
app.get('/training', (req, res) => {
  res.render('pages/training', {
    pageTitle: 'Training & licensing',
    activeNav: 'training',
    pageCSS: 'training',
  });
});

// Underwriting hub
app.get('/underwriting-hub', (req, res) => {
  res.render('pages/underwriting-hub', {
    pageTitle: 'Underwriting hub',
    activeNav: 'underwriting',
    pageCSS: 'underwriting-hub',
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
