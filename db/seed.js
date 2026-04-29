const pool = require('./pool');

const customers = [
  // ── TOP ACCOUNTS (commercial) ──
  { slug: 'crestline-bakery', name: 'Crestline Bakery LLC', initials: 'CB', customer_type: 'business', detail: 'Commercial package · BOP + WC + cyber pending', premium: 46100, policy_count: 2, tenure_display: '6yr', retention_score: 74, avatar_style: null, group_key: 'top_accounts', sort_order: 1 },
  { slug: 'martinez-auto-group', name: 'Martinez Auto Group', initials: 'MA', customer_type: 'business', detail: 'Commercial fleet · 14 vehicles · multi-location', premium: 42600, policy_count: 3, tenure_display: '5yr', retention_score: 66, avatar_style: null, group_key: 'top_accounts', sort_order: 2 },
  { slug: 'nguyen-construction', name: 'Nguyen Construction', initials: 'NC', customer_type: 'business', detail: 'GL + workers comp · 22 employees · fleet of 8', premium: 28400, policy_count: 2, tenure_display: '4yr', retention_score: 76, avatar_style: null, group_key: 'top_accounts', sort_order: 3 },

  // ── Attention-only customers (not in table groups but appear in attention cards) ──
  { slug: 'kim-s', name: 'Kim, S.', initials: 'KS', customer_type: 'individual', detail: '2 claims in 24 months · Progressive shopping signal', premium: 1420, policy_count: 1, tenure_display: '3yr', retention_score: 58, avatar_style: null, group_key: 'attention_only', sort_order: 1 },
  { slug: 'greenfield-dental', name: 'Greenfield Dental', initials: 'GD', customer_type: 'business', detail: 'New FNOL — water damage from burst pipe', premium: 12400, policy_count: 2, tenure_display: '3yr', retention_score: null, avatar_style: null, group_key: 'attention_only', sort_order: 2 },
  { slug: 'blackwood-properties', name: 'Blackwood Properties', initials: 'BP', customer_type: 'business', detail: 'Shopping portfolio with Nationwide', premium: 8200, policy_count: 3, tenure_display: '4yr', retention_score: null, avatar_style: null, group_key: 'attention_only', sort_order: 3 },
  { slug: 'westbrook-d', name: 'Westbrook, D.', initials: 'WD', customer_type: 'individual', detail: 'New FNOL — rear-end collision Apr 26', premium: 2040, policy_count: 1, tenure_display: '2yr', retention_score: null, avatar_style: null, group_key: 'attention_only', sort_order: 4 },
  { slug: 'henderson-t', name: 'Henderson, T.', initials: 'HT', customer_type: 'individual', detail: 'Teen driver endorsement in UW review', premium: 1580, policy_count: 1, tenure_display: '4yr', retention_score: null, avatar_style: null, group_key: 'attention_only', sort_order: 5 },
  { slug: 'chen-l', name: 'Chen, L.', initials: 'CL', customer_type: 'individual', detail: 'Investment property deal stalled 8 days', premium: 3000, policy_count: 1, tenure_display: '2yr', retention_score: null, avatar_style: null, group_key: 'attention_only', sort_order: 6 },

  // ── PERSONAL LINES (recently active) ──
  { slug: 'ramirez-household', name: 'Ramirez household', initials: 'RM', customer_type: 'household', detail: 'Carlos & Elena · 4 members · gold tier', premium: 8640, policy_count: 5, tenure_display: '7yr', retention_score: 62, avatar_style: 'highlight', group_key: 'personal', sort_order: 1 },
  { slug: 'lin-household', name: 'Lin household', initials: 'LH', customer_type: 'household', detail: 'Roof replacement per inspection · hail claim', premium: 4200, policy_count: 2, tenure_display: '5yr', retention_score: 72, avatar_style: null, group_key: 'personal', sort_order: 2 },
  { slug: 'patel-household', name: 'Patel household', initials: 'PH', customer_type: 'household', detail: 'Recently re-quoted · bundled · auto-pay', premium: 3880, policy_count: 3, tenure_display: '6yr', retention_score: 89, avatar_style: null, group_key: 'personal', sort_order: 3 },
  { slug: 'reeves-household', name: 'Reeves household', initials: 'RH', customer_type: 'household', detail: 'New-to-book · auto+home bundle · referred by Donovan', premium: 3480, policy_count: 2, tenure_display: '1mo', retention_score: 90, avatar_style: 'new', group_key: 'personal', sort_order: 4 },
  { slug: 'dawson-k', name: 'Dawson, K.', initials: 'DK', customer_type: 'household', detail: 'Auto+home+umbrella · 8-year client · top referrer', premium: 2800, policy_count: 3, tenure_display: '8yr', retention_score: 85, avatar_style: null, group_key: 'personal', sort_order: 5 },
  { slug: 'donovan-m', name: 'Donovan, M.', initials: 'DM', customer_type: 'individual', detail: 'Umbrella upsell just completed · boat purchase', premium: 2420, policy_count: 2, tenure_display: '5yr', retention_score: 88, avatar_style: null, group_key: 'personal', sort_order: 6 },
  { slug: 'olsen-r', name: 'Olsen, R.', initials: 'OR', customer_type: 'individual', detail: 'Garage endorsement recently processed', premium: 2340, policy_count: 1, tenure_display: '3yr', retention_score: 83, avatar_style: null, group_key: 'personal', sort_order: 7 },
  { slug: 'walsh-family', name: 'Walsh family', initials: 'WF', customer_type: 'household', detail: 'First-time homebuyer · prospect in pipeline', premium: 2100, policy_count: 1, tenure_display: '1yr', retention_score: 84, avatar_style: null, group_key: 'personal', sort_order: 8 },
  { slug: 'park-j', name: 'Park, J.', initials: 'PJ', customer_type: 'individual', detail: 'Renters → homeowners conversion · closing May 8', premium: 1890, policy_count: 1, tenure_display: '2yr', retention_score: 86, avatar_style: null, group_key: 'personal', sort_order: 9 },
  { slug: 'yamamoto-k', name: 'Yamamoto, K.', initials: 'YK', customer_type: 'individual', detail: 'Personal umbrella · $2M limit · renews May 6', premium: 620, policy_count: 1, tenure_display: '4yr', retention_score: 91, avatar_style: null, group_key: 'personal', sort_order: 10 },
];

const customerLines = {
  'crestline-bakery': ['commercial'],
  'martinez-auto-group': ['commercial'],
  'nguyen-construction': ['commercial'],
  'kim-s': ['auto'],
  'greenfield-dental': ['commercial'],
  'blackwood-properties': ['commercial'],
  'westbrook-d': ['auto'],
  'henderson-t': ['auto'],
  'chen-l': ['home'],
  'ramirez-household': ['auto', 'home'],
  'lin-household': ['auto', 'home'],
  'patel-household': ['auto', 'home'],
  'reeves-household': ['auto', 'home'],
  'dawson-k': ['bundle'],
  'donovan-m': ['umbrella'],
  'olsen-r': ['home'],
  'walsh-family': ['home'],
  'park-j': ['home'],
  'yamamoto-k': ['umbrella'],
};

const signalDots = {
  'crestline-bakery': [
    { color: 'amber', tooltip: 'Cyber add-on pending' },
    { color: 'blue', tooltip: 'Renewal May 4' },
  ],
  'martinez-auto-group': [
    { color: 'red', tooltip: 'At-risk renewal' },
    { color: 'amber', tooltip: 'Claim pending settlement' },
  ],
  'nguyen-construction': [
    { color: 'amber', tooltip: 'WC claim in review' },
    { color: 'blue', tooltip: 'UW submission pending' },
  ],
  'ramirez-household': [
    { color: 'red', tooltip: 'Competing quote' },
    { color: 'red', tooltip: 'Renewal in 3 days' },
  ],
  'lin-household': [{ color: 'amber', tooltip: 'Claim in review' }],
  'patel-household': [{ color: 'green', tooltip: 'Healthy' }],
  'reeves-household': [{ color: 'green', tooltip: 'New client' }],
  'dawson-k': [{ color: 'green', tooltip: 'Healthy' }],
  'donovan-m': [{ color: 'green', tooltip: 'Healthy' }],
  'olsen-r': [{ color: 'green', tooltip: 'Healthy' }],
  'walsh-family': [{ color: 'blue', tooltip: 'Pipeline deal' }],
  'park-j': [{ color: 'blue', tooltip: 'Home closing soon' }],
  'yamamoto-k': [{ color: 'green', tooltip: 'Auto-renew' }],
};

const alerts = [
  {
    slug: 'ramirez-household',
    flag_type: 'at-risk',
    is_urgent: true,
    meta: '5 policies · $8,640/yr · 7yr client',
    action_text: 'Review now →',
    signals: [
      { text: 'Competing State Farm quote — $660 below renewal', warn: true },
      { text: 'Renewal in 3 days · +18.4% premium increase', warn: true },
      { text: 'Retention score dropped to 62', warn: false },
    ],
    lines: ['auto', 'home', 'umbrella', 'life'],
  },
  {
    slug: 'kim-s',
    flag_type: 'at-risk',
    is_urgent: true,
    meta: '1 policy · $1,420/yr · 3yr client',
    action_text: 'Contact now →',
    signals: [
      { text: '2 claims in 24 months — retention score 58', warn: true },
      { text: 'Progressive shopping signal detected', warn: true },
      { text: 'Payment 30 days past due · renewal May 15', warn: false },
    ],
    lines: ['auto'],
  },
  {
    slug: 'greenfield-dental',
    flag_type: 'claim',
    is_urgent: false,
    meta: '2 policies · $12,400/yr · 3yr client',
    action_text: 'Review FNOL →',
    signals: [
      { text: 'New FNOL — water damage from burst pipe', warn: true },
      { text: 'High severity · $24K reserve · office closed 2 days', warn: false },
      { text: 'Business interruption coverage applies', warn: false },
    ],
    lines: ['commercial'],
  },
  {
    slug: 'blackwood-properties',
    flag_type: 'at-risk',
    is_urgent: false,
    meta: '3 properties · $8,200/yr · 4yr client',
    action_text: 'Review →',
    signals: [
      { text: 'Shopping portfolio with Nationwide', warn: true },
      { text: 'Liability claim in legal review · $35K reserve', warn: false },
      { text: 'Payment 14 days past due · $4,100 balance', warn: false },
    ],
    lines: ['commercial'],
  },
  {
    slug: 'westbrook-d',
    flag_type: 'claim',
    is_urgent: false,
    meta: '1 policy · $2,040/yr · 2yr client',
    action_text: 'Review FNOL →',
    signals: [
      { text: 'New FNOL — rear-end collision Apr 26', warn: false },
      { text: 'Medium severity · $8,400 reserve', warn: false },
    ],
    lines: ['auto'],
  },
  {
    slug: 'henderson-t',
    flag_type: 'pending',
    is_urgent: false,
    meta: '1 policy · $1,580/yr · 4yr client',
    action_text: 'Follow up →',
    signals: [
      { text: 'Teen driver endorsement in UW review — 3 days', warn: false },
      { text: '67% longer than avg turnaround', warn: false },
    ],
    lines: ['auto'],
  },
  {
    slug: 'chen-l',
    flag_type: 'at-risk',
    is_urgent: false,
    meta: '1 policy · $3,000/yr · 2yr client',
    action_text: 'Re-quote →',
    signals: [
      { text: 'Investment property deal stalled 8 days', warn: true },
      { text: 'Competing Allstate quote received', warn: false },
    ],
    lines: ['home'],
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM customer_alert_lines');
    await client.query('DELETE FROM customer_alert_signals');
    await client.query('DELETE FROM customer_alerts');
    await client.query('DELETE FROM customer_signal_dots');
    await client.query('DELETE FROM customer_lines');
    await client.query('DELETE FROM customers');

    // Insert customers
    const idMap = {};
    for (const c of customers) {
      const { rows } = await client.query(
        `INSERT INTO customers (slug, name, initials, customer_type, detail, premium, policy_count, tenure_display, retention_score, avatar_style, group_key, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
        [c.slug, c.name, c.initials, c.customer_type, c.detail, c.premium, c.policy_count, c.tenure_display, c.retention_score, c.avatar_style, c.group_key, c.sort_order]
      );
      idMap[c.slug] = rows[0].id;
    }

    // Insert lines
    for (const [slug, lines] of Object.entries(customerLines)) {
      for (let i = 0; i < lines.length; i++) {
        await client.query(
          'INSERT INTO customer_lines (customer_id, line_type, sort_order) VALUES ($1,$2,$3)',
          [idMap[slug], lines[i], i]
        );
      }
    }

    // Insert signal dots
    for (const [slug, dots] of Object.entries(signalDots)) {
      for (let i = 0; i < dots.length; i++) {
        await client.query(
          'INSERT INTO customer_signal_dots (customer_id, color, tooltip, sort_order) VALUES ($1,$2,$3,$4)',
          [idMap[slug], dots[i].color, dots[i].tooltip, i]
        );
      }
    }

    // Insert alerts and their signals
    for (let i = 0; i < alerts.length; i++) {
      const a = alerts[i];
      const { rows } = await client.query(
        `INSERT INTO customer_alerts (customer_id, flag_type, is_urgent, meta, action_text, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [idMap[a.slug], a.flag_type, a.is_urgent, a.meta, a.action_text, i]
      );
      const alertId = rows[0].id;

      for (let j = 0; j < a.signals.length; j++) {
        await client.query(
          'INSERT INTO customer_alert_signals (alert_id, signal_text, is_warn, sort_order) VALUES ($1,$2,$3,$4)',
          [alertId, a.signals[j].text, a.signals[j].warn, j]
        );
      }

      for (let k = 0; k < a.lines.length; k++) {
        await client.query(
          'INSERT INTO customer_alert_lines (alert_id, line_type, sort_order) VALUES ($1,$2,$3)',
          [alertId, a.lines[k], k]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`Seeded ${customers.length} customers, ${alerts.length} alerts.`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seed;
