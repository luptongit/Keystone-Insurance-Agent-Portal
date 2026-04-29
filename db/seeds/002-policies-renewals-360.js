const pool = require('../pool');

// Helper: get customer id by slug
async function cid(client, slug) {
  const { rows } = await client.query('SELECT id FROM customers WHERE slug = $1', [slug]);
  if (!rows.length) throw new Error(`Customer not found: ${slug}`);
  return rows[0].id;
}

// Additional customers that only appear on Renewals/Policies pages
const extraCustomers = [
  { slug: 'torres-a', name: 'Torres, A.', initials: 'TA', customer_type: 'individual', detail: 'Clean record · rate hold', premium: 1180, policy_count: 1, tenure_display: '3yr', retention_score: 93, group_key: 'attention_only', sort_order: 10 },
  { slug: 'okonkwo-a', name: 'Okonkwo, A.', initials: 'OA', customer_type: 'individual', detail: 'Level term · no change', premium: 840, policy_count: 1, tenure_display: '5yr', retention_score: 95, group_key: 'attention_only', sort_order: 11 },
  { slug: 'mercer-sons', name: 'Mercer & Sons', initials: 'MS', customer_type: 'business', detail: 'Expanding to second location', premium: 4400, policy_count: 1, tenure_display: '3yr', retention_score: 78, group_key: 'attention_only', sort_order: 12 },
];

async function seed(client) {
  // Insert extra customers
  const idMap = {};
  for (const c of extraCustomers) {
    const { rows } = await client.query(
      `INSERT INTO customers (slug, name, initials, customer_type, detail, premium, policy_count, tenure_display, retention_score, group_key, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [c.slug, c.name, c.initials, c.customer_type, c.detail, c.premium, c.policy_count, c.tenure_display, c.retention_score, c.group_key, c.sort_order]
    );
    idMap[c.slug] = rows[0].id;
  }

  // Update Ramirez with 360 detail fields
  const ramirezId = await cid(client, 'ramirez-household');
  await client.query(
    `UPDATE customers SET
       location = 'Fort Worth, TX 76109',
       client_since = 'March 2019',
       member_count = 4,
       lifetime_value = '$38.2K',
       tier = 'Gold',
       email = 'cramirez@gmail.com',
       phone = '(817) 555-0188',
       preferred_contact = 'Text · evenings',
       language = 'English / Spanish',
       retention_detail_score = 84
     WHERE id = $1`,
    [ramirezId]
  );

  // ── POLICIES (Customer 360 — Ramirez) ──
  const policies = [
    { customer_slug: 'ramirez-household', policy_number: 'POL-AU-771422', line_type: 'auto', title: 'Personal auto — 2 vehicles', subtitle: '2022 Honda CR-V · 2019 Toyota Camry · Carlos & Elena Ramirez', premium: 1840, payment_freq: 'monthly autopay', status: 'renewal', status_label: 'Renews 5d', sort_order: 1 },
    { customer_slug: 'ramirez-household', policy_number: 'POL-HO-441208', line_type: 'home', title: 'Homeowners — HO-3 standard', subtitle: '3,420 sqft · built 2008 · $485K dwelling · $50K personal property', premium: 2000, payment_freq: '$500 deductible', status: 'renewal', status_label: 'Renews 5d', sort_order: 2 },
    { customer_slug: 'ramirez-household', policy_number: 'POL-UM-090714', line_type: 'umbrella', title: 'Personal umbrella — $2M limit', subtitle: 'Excess liability above auto and home · added July 2022', premium: 340, payment_freq: 'annual pay', status: 'active', status_label: 'Active', sort_order: 3 },
    { customer_slug: 'ramirez-household', policy_number: 'POL-LF-220103', line_type: 'life', title: 'Term life — Carlos Ramirez', subtitle: '$500K · 20-year term · issued 2021 · standard non-tobacco', premium: 640, payment_freq: 'quarterly', status: 'active', status_label: 'Active', sort_order: 4 },
    { customer_slug: 'ramirez-household', policy_number: 'POL-LF-220104', line_type: 'life', title: 'Term life — Elena Ramirez', subtitle: '$400K · 20-year term · issued 2021 · standard non-tobacco', premium: 600, payment_freq: 'quarterly', status: 'active', status_label: 'Active', sort_order: 5 },
  ];

  for (const p of policies) {
    const custId = await cid(client, p.customer_slug);
    await client.query(
      `INSERT INTO policies (customer_id, policy_number, line_type, title, subtitle, premium, payment_freq, status, status_label, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [custId, p.policy_number, p.line_type, p.title, p.subtitle, p.premium, p.payment_freq, p.status, p.status_label, p.sort_order]
    );
  }

  // ── HOUSEHOLD MEMBERS (Ramirez) ──
  const members = [
    { name: 'Carlos Ramirez', initials: 'CR', relationship: 'Primary · age 44', detail: 'DL · Driver · Insured (life)', avatar_class: 'a' },
    { name: 'Elena Ramirez', initials: 'ER', relationship: 'Spouse · age 42', detail: 'DL · Driver · Insured (life)', avatar_class: 'b' },
    { name: 'Sofia Ramirez', initials: 'SR', relationship: 'Daughter · age 17', detail: 'Permit · Eligible to add', avatar_class: 'c' },
    { name: 'Diego Ramirez', initials: 'DR', relationship: 'Son · age 14', detail: 'Dependent', avatar_class: 'd' },
  ];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    await client.query(
      'INSERT INTO household_members (customer_id, name, initials, relationship, detail, avatar_class, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [ramirezId, m.name, m.initials, m.relationship, m.detail, m.avatar_class, i]
    );
  }

  // ── TIMELINE EVENTS (Ramirez) ──
  const events = [
    { event_type: 'note', event_time: '2 days ago', title: 'Internal note — competing quote received', detail: 'Carlos called this morning. State Farm quoted $3,180 for the auto+home bundle vs our $3,840. He sounded open to staying but wants to see if we can match. Renewal is May 2.', attribution: 'Maya Chen · 9:14 AM' },
    { event_type: 'policy', event_time: '2 days ago', title: 'Renewal package generated — auto + home', detail: 'Renewal premiums calculated with +18.4% increase driven by territory loss trends and roof age (16yr).', attribution: 'System · automated' },
    { event_type: 'payment', event_time: 'Apr 14', title: 'Payment received — $153.33', detail: 'Auto policy monthly autopay · ACH from Wells Fargo ending 4421', attribution: 'System · billing' },
    { event_type: 'contact', event_time: 'Apr 8', title: 'Email opened — newsletter "Spring driving tips"', detail: 'Marketing campaign · Q2 personal lines newsletter', attribution: 'Marketing studio · automated' },
    { event_type: 'claim', event_time: 'Feb 3', title: 'Claim closed — windshield replacement', detail: 'Claim CLM-2025-09221 · 2022 Honda CR-V · paid $487 to Safelite · zero deductible (glass coverage)', attribution: 'Adjuster: J. Patterson' },
    { event_type: 'policy', event_time: 'Aug 2024', title: 'Endorsement — added 2022 Honda CR-V', detail: 'Replaced 2014 Honda Pilot · premium impact +$340/yr', attribution: 'Maya Chen · self-service' },
  ];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    await client.query(
      'INSERT INTO timeline_events (customer_id, event_type, event_time, title, detail, attribution, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [ramirezId, e.event_type, e.event_time, e.title, e.detail, e.attribution, i]
    );
  }

  // ── RETENTION FACTORS (Ramirez) ──
  const factors = [
    { label: 'Bundle strength', value: 'Strong', sentiment: 'pos' },
    { label: 'Claims history', value: 'Clean', sentiment: 'pos' },
    { label: 'Tenure', value: '7 years', sentiment: 'pos' },
    { label: 'Renewal premium change', value: '+18.4%', sentiment: 'neg' },
    { label: 'Competing quote received', value: 'Yes', sentiment: 'neg' },
  ];
  for (let i = 0; i < factors.length; i++) {
    const f = factors[i];
    await client.query(
      'INSERT INTO retention_factors (customer_id, label, value, sentiment, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [ramirezId, f.label, f.value, f.sentiment, i]
    );
  }

  // ── OPPORTUNITIES (Ramirez) ──
  const opps = [
    {
      title: 'Add Sofia to auto policy',
      description: 'Sofia turned 17 last month and holds a learner\'s permit per public records. Adding her now establishes a driving record with your carrier.',
      confidence: 94,
      icon_svg: '<path d="M3 13l2-7h14l2 7M5 13h14M5 13v5a1 1 0 001 1h2a1 1 0 001-1v-1"/>',
      meta_left: 'Est. premium: +$680/yr', meta_right: '3 min flow',
    },
    {
      title: 'Increase umbrella to $3M',
      description: 'Net worth indicators and incoming teen driver suggest $3M is more appropriate. Carlos requested revisiting at last renewal.',
      confidence: 71,
      icon_svg: '<path d="M12 2v2M2 12c0-5.5 4.5-10 10-10s10 4.5 10 10H2zM12 12v8a2 2 0 11-4 0"/>',
      meta_left: 'Est. premium: +$120/yr', meta_right: '1 min flow',
    },
    {
      title: '529 college savings plan',
      description: 'Two children approaching college age. Family-tier financial product available through carrier financial services arm.',
      confidence: 62,
      icon_svg: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
      meta_left: 'Discovery call', meta_right: 'Refer to FA',
    },
  ];
  for (let i = 0; i < opps.length; i++) {
    const o = opps[i];
    await client.query(
      'INSERT INTO opportunities (customer_id, title, description, confidence, icon_svg, meta_left, meta_right, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [ramirezId, o.title, o.description, o.confidence, o.icon_svg, o.meta_left, o.meta_right, i]
    );
  }

  // ── POLICY PAGE ROWS ──
  const policyRows = [
    // Recently issued
    { slug: 'reeves-household', detail: 'Auto + home bundle · new-to-book', policy_number: 'HBL-2026-04182', premium: 3480, effective_date: 'Apr 22', expiration_date: 'Apr 22, 2027', status: 'active', row_style: null, group_key: 'recently_issued', lines: ['auto', 'home'] },
    { slug: 'park-j', detail: 'Renters → homeowners conversion', policy_number: 'HOM-2026-04156', premium: 1890, effective_date: 'Apr 18', expiration_date: 'Apr 18, 2027', status: 'active', row_style: null, group_key: 'recently_issued', lines: ['home'] },
    { slug: 'donovan-m', detail: 'Umbrella upsell $1M → $2M', policy_number: 'UMB-2026-04098', premium: 380, effective_date: 'Apr 15', expiration_date: 'Apr 15, 2027', status: 'active', row_style: null, group_key: 'recently_issued', lines: ['umbrella'] },
    // Pending endorsements
    { slug: 'henderson-t', detail: 'Teen driver add · pending UW review', policy_number: 'AUT-2022-08341', premium: 1580, effective_date: 'Aug 12, 2022', expiration_date: 'Aug 12, 2026', status: 'pending', row_style: 'pending', group_key: 'pending_endorsements', lines: ['auto'] },
    { slug: 'olsen-r', detail: 'Garage addition · coverage increase', policy_number: 'HOM-2023-02187', premium: 2340, effective_date: 'Feb 8, 2023', expiration_date: 'Feb 8, 2027', status: 'pending', row_style: 'pending', group_key: 'pending_endorsements', lines: ['home'] },
    { slug: 'crestline-bakery', detail: 'Cyber liability add-on', policy_number: 'BOP-2020-06442', premium: 46100, effective_date: 'Jun 1, 2020', expiration_date: 'Jun 1, 2026', status: 'pending', row_style: 'pending', group_key: 'pending_endorsements', lines: ['commercial'] },
    // Active claims
    { slug: 'westbrook-d', detail: 'Collision claim · rear-end accident Apr 14', policy_number: 'AUT-2024-03089', premium: 2040, effective_date: 'Mar 1, 2024', expiration_date: 'Mar 1, 2027', status: 'claim', row_style: 'claim', group_key: 'active_claims', lines: ['auto'] },
    { slug: 'lin-household', detail: 'Roof damage · hail event Mar 28', policy_number: 'HOM-2021-11254', premium: 4200, effective_date: 'Nov 15, 2021', expiration_date: 'Nov 15, 2026', status: 'claim', row_style: 'claim', group_key: 'active_claims', lines: ['home'] },
  ];

  for (let i = 0; i < policyRows.length; i++) {
    const r = policyRows[i];
    const custId = await cid(client, r.slug);
    const { rows } = await client.query(
      `INSERT INTO policy_page_rows (customer_id, detail, policy_number, premium, effective_date, expiration_date, status, row_style, group_key, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [custId, r.detail, r.policy_number, r.premium, r.effective_date, r.expiration_date, r.status, r.row_style, r.group_key, i]
    );
    for (let j = 0; j < r.lines.length; j++) {
      await client.query(
        'INSERT INTO policy_page_row_lines (row_id, line_type, sort_order) VALUES ($1,$2,$3)',
        [rows[0].id, r.lines[j], j]
      );
    }
  }

  // ── RENEWALS ──
  const renewalRows = [
    // This week
    { slug: 'ramirez-household', detail: 'Carlos & Elena · since 2019', current_premium: 3240, renewal_premium: 3840, change_pct: 18.4, change_dir: 'up', renewal_date: 'May 2', date_urgency: 'urgent', retention_score: 62, status: 'at-risk', is_at_risk: true, group_key: 'this_week', lines: ['auto', 'home'] },
    { slug: 'crestline-bakery', detail: 'Commercial package · BOP + WC', current_premium: 46100, renewal_premium: 48200, change_pct: 4.6, change_dir: 'up', renewal_date: 'May 4', date_urgency: 'soon', retention_score: 74, status: 'review', is_at_risk: false, group_key: 'this_week', lines: ['commercial'] },
    { slug: 'yamamoto-k', detail: 'Personal umbrella · $2M limit', current_premium: 620, renewal_premium: 640, change_pct: 3.2, change_dir: 'up', renewal_date: 'May 6', date_urgency: 'soon', retention_score: 91, status: 'auto-renew', is_at_risk: false, group_key: 'this_week', lines: ['umbrella'] },
    // Next 2 weeks
    { slug: 'henderson-t', detail: 'Good driver · teen add pending', current_premium: 1580, renewal_premium: 1640, change_pct: 3.8, change_dir: 'up', renewal_date: 'May 9', date_urgency: null, retention_score: 87, status: 'auto-renew', is_at_risk: false, group_key: 'next_2_weeks', lines: ['auto'] },
    { slug: 'patel-household', detail: 'Recently re-quoted · bundled', current_premium: 3880, renewal_premium: 4032, change_pct: 3.9, change_dir: 'up', renewal_date: 'May 11', date_urgency: null, retention_score: 89, status: 'auto-renew', is_at_risk: false, group_key: 'next_2_weeks', lines: ['auto', 'home'] },
    { slug: 'greenfield-dental', detail: 'BOP + Prof liability · cyber add', current_premium: 12400, renewal_premium: 13100, change_pct: 5.6, change_dir: 'up', renewal_date: 'May 12', date_urgency: null, retention_score: 71, status: 'review', is_at_risk: false, group_key: 'next_2_weeks', lines: ['commercial'] },
    { slug: 'olsen-r', detail: 'Garage endorsement processed', current_premium: 2340, renewal_premium: 2480, change_pct: 6.0, change_dir: 'up', renewal_date: 'May 13', date_urgency: null, retention_score: 83, status: 'auto-renew', is_at_risk: false, group_key: 'next_2_weeks', lines: ['home'] },
    { slug: 'donovan-m', detail: 'Boat purchase · umbrella review', current_premium: 360, renewal_premium: 380, change_pct: 5.6, change_dir: 'up', renewal_date: 'May 15', date_urgency: null, retention_score: 88, status: 'auto-renew', is_at_risk: false, group_key: 'next_2_weeks', lines: ['umbrella'] },
    { slug: 'kim-s', detail: '2 claims in 24mo · Progressive signal', current_premium: 1420, renewal_premium: 1540, change_pct: 8.5, change_dir: 'up', renewal_date: 'May 15', date_urgency: null, retention_score: 58, status: 'at-risk', is_at_risk: true, group_key: 'next_2_weeks', lines: ['auto'] },
    // 30 days
    { slug: 'walsh-family', detail: 'First-time homebuyer · new policy', current_premium: 2100, renewal_premium: 2220, change_pct: 5.7, change_dir: 'up', renewal_date: 'May 19', date_urgency: null, retention_score: 84, status: 'auto-renew', is_at_risk: false, group_key: '30_days', lines: ['home'] },
    { slug: 'reeves-household', detail: 'Recently bound · bundle discount', current_premium: 3280, renewal_premium: 3480, change_pct: 6.1, change_dir: 'up', renewal_date: 'May 22', date_urgency: null, retention_score: 90, status: 'auto-renew', is_at_risk: false, group_key: '30_days', lines: ['auto', 'home'] },
    { slug: 'nguyen-construction', detail: 'Workers comp audit due · 22 emp', current_premium: 26800, renewal_premium: 28400, change_pct: 6.0, change_dir: 'up', renewal_date: 'May 24', date_urgency: null, retention_score: 76, status: 'review', is_at_risk: false, group_key: '30_days', lines: ['commercial'] },
    { slug: 'torres-a', detail: 'Clean record · rate hold', current_premium: 1180, renewal_premium: 1180, change_pct: 0.0, change_dir: 'flat', renewal_date: 'May 25', date_urgency: null, retention_score: 93, status: 'auto-renew', is_at_risk: false, group_key: '30_days', lines: ['auto'] },
    { slug: 'blackwood-properties', detail: '3-property portfolio · Nationwide signal', current_premium: 8200, renewal_premium: 8900, change_pct: 8.5, change_dir: 'up', renewal_date: 'May 26', date_urgency: null, retention_score: 64, status: 'at-risk', is_at_risk: true, group_key: '30_days', lines: ['commercial'] },
    { slug: 'okonkwo-a', detail: 'Level term · no change', current_premium: 840, renewal_premium: 840, change_pct: 0.0, change_dir: 'flat', renewal_date: 'May 27', date_urgency: null, retention_score: 95, status: 'auto-renew', is_at_risk: false, group_key: '30_days', lines: ['life'] },
    { slug: 'park-j', detail: 'Closing May 8 · 2,400 sq ft', current_premium: 1880, renewal_premium: 1960, change_pct: 4.3, change_dir: 'up', renewal_date: 'May 28', date_urgency: null, retention_score: 86, status: 'auto-renew', is_at_risk: false, group_key: '30_days', lines: ['home'] },
    { slug: 'mercer-sons', detail: 'Expanding to second location', current_premium: 4400, renewal_premium: 4600, change_pct: 4.5, change_dir: 'up', renewal_date: 'May 29', date_urgency: null, retention_score: 78, status: 'review', is_at_risk: false, group_key: '30_days', lines: ['commercial'] },
    // 60 days
    { slug: 'westbrook-d', detail: 'Active collision claim pending', current_premium: 2040, renewal_premium: 2180, change_pct: 6.9, change_dir: 'up', renewal_date: 'Jun 8', date_urgency: null, retention_score: 79, status: 'review', is_at_risk: false, group_key: '60_days', lines: ['auto'] },
    { slug: 'lin-household', detail: 'Roof replacement per inspection', current_premium: 4200, renewal_premium: 4480, change_pct: 6.7, change_dir: 'up', renewal_date: 'Jun 14', date_urgency: null, retention_score: 72, status: 'review', is_at_risk: false, group_key: '60_days', lines: ['auto', 'home'] },
    { slug: 'martinez-auto-group', detail: 'Largest commercial · fleet negotiation', current_premium: 38900, renewal_premium: 42600, change_pct: 9.5, change_dir: 'up', renewal_date: 'Jun 18', date_urgency: null, retention_score: 66, status: 'at-risk', is_at_risk: true, group_key: '60_days', lines: ['commercial'] },
    { slug: 'chen-l', detail: 'Investment property · Allstate quote', current_premium: 3000, renewal_premium: 3200, change_pct: 6.7, change_dir: 'up', renewal_date: 'Jun 22', date_urgency: null, retention_score: 61, status: 'at-risk', is_at_risk: true, group_key: '60_days', lines: ['home'] },
    { slug: 'dawson-k', detail: 'Auto+home+umbrella · long-term', current_premium: 2800, renewal_premium: 2940, change_pct: 5.0, change_dir: 'up', renewal_date: 'Jun 28', date_urgency: null, retention_score: 85, status: 'auto-renew', is_at_risk: false, group_key: '60_days', lines: ['bundle'] },
  ];

  for (let i = 0; i < renewalRows.length; i++) {
    const r = renewalRows[i];
    const custId = await cid(client, r.slug);
    const { rows } = await client.query(
      `INSERT INTO renewals (customer_id, detail, current_premium, renewal_premium, change_pct, change_dir, renewal_date, date_urgency, retention_score, status, is_at_risk, group_key, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [custId, r.detail, r.current_premium, r.renewal_premium, r.change_pct, r.change_dir, r.renewal_date, r.date_urgency, r.retention_score, r.status, r.is_at_risk, r.group_key, i]
    );
    for (let j = 0; j < r.lines.length; j++) {
      await client.query(
        'INSERT INTO renewal_lines (renewal_id, line_type, sort_order) VALUES ($1,$2,$3)',
        [rows[0].id, r.lines[j], j]
      );
    }
  }

  console.log(`Seeded: ${policies.length} policies, ${policyRows.length} policy page rows, ${renewalRows.length} renewals, ${members.length} household members, ${events.length} timeline events, ${factors.length} retention factors, ${opps.length} opportunities.`);
}

if (require.main === module) {
  (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await seed(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
      await pool.end();
    }
  })().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seed;
