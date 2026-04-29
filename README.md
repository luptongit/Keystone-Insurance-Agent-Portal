# Keystone Portal

Demo agent portal for enterprise insurance carriers. Express + EJS, ready for local dev and Heroku deployment.

## What's in here

```
keystone-app/
├── server.js              # Express app + routes
├── package.json
├── Procfile               # Heroku web process
├── .node-version          # Heroku Node 20
├── public/
│   ├── css/
│   │   ├── keystone.css   # Master stylesheet (all design tokens, components)
│   │   └── quote-flow.css # Quote-flow-specific styles
│   └── js/                # (empty — for future client JS)
└── views/
    ├── partials/
    │   ├── head.ejs       # <head>, fonts, CSS link
    │   ├── foot.ejs       # closing tags
    │   ├── sidebar.ejs    # nav + active-state highlighting
    │   └── topbar.ejs     # search/breadcrumb + actions
    └── pages/
        ├── login.ejs
        ├── dashboard.ejs       (Home)
        ├── customer-360.ejs    (Ramirez household)
        ├── quote-flow.ejs      (Patel multi-line quote)
        ├── agent-360.ejs       (Maya Chen)
        ├── platform-map.ejs    (marketing-style overview)
        └── coming-soon.ejs     (placeholder for unbuilt routes)
```

## Local development

You'll need Node 20.x. Then:

```bash
cd keystone-app
npm install
npm run dev
```

Visit http://localhost:3000.

`npm run dev` uses nodemon — it auto-restarts on file changes. Use `npm start` for the plain mode.

## Working in VS Code

Recommended extensions:
- **EJS language support** (DigitalBrainstem.javascript-ejs-support) — syntax highlighting for `.ejs` files
- **ESLint** — if you want lint-on-save
- **Prettier** — code formatting

There's no `.vscode/` folder committed. If you want format-on-save, drop a `.vscode/settings.json` with:
```json
{ "editor.formatOnSave": true }
```

## Routes

The five flagship flows are fully built:
- `/` — Home dashboard
- `/customers` → `/customers/ramirez-household` — Customer 360
- `/quote/new` — Multi-line quote flow
- `/agent-360` — Agent 360 / coaching
- `/platform-map` — marketing-style platform overview
- `/login` — login screen

Every other sidebar nav item (Claims, Renewals, Billing, Marketing Studio, Underwriting Hub, etc.) renders a friendly "coming soon" page so navigation never breaks during a live demo.

## Deploying to Heroku

First-time setup:

```bash
# from the keystone-app directory
git init
git add .
git commit -m "Initial Keystone build"

# create the Heroku app
heroku create keystone-portal-demo   # or whatever name you want

# deploy
git push heroku main
heroku open
```

If you already had this in a git repo when you started, skip `git init` and just commit the new files.

For subsequent deploys, just:
```bash
git add .
git commit -m "..."
git push heroku main
```

## Customizing for a specific carrier demo

The two most carrier-specific things you'll want to swap:

**1. The agency name and producer.** In `server.js`, edit:
```js
res.locals.user = { initials: 'MC', name: 'Maya Chen', role: 'Producer · Harborlight' };
```

**2. The brand colors.** All in `public/css/keystone.css` at the top under `:root`:
```css
--keystone-blue: #0C447C;   /* primary brand color */
--bronze: #BA7517;          /* accent (hover, active states) */
```

Change those two and the entire portal re-themes.

## Adding a new page

1. Add a route in `server.js`
2. Add the page to the `navSections` array in `views/partials/sidebar.ejs` if it should appear in the nav
3. Create the EJS template in `views/pages/`

That's it.
