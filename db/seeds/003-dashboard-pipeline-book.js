const pool = require('../pool');

async function cid(client, slug) {
  const { rows } = await client.query('SELECT id FROM customers WHERE slug = $1', [slug]);
  if (!rows.length) throw new Error(`Customer not found: ${slug}`);
  return rows[0].id;
}

async function seed(client) {
  // ── ACTION QUEUE ──
  const queue = [
    { slug: 'ramirez-household', priority: 'high', title: 'Renewal at risk — Ramirez household (auto + home)', subtitle: 'Premium increase 18.4% · competing quote signal · expires May 2', tag: 'renewal', tag_label: 'Renewal', time_label: '3d', href: '/customers/ramirez-household' },
    { slug: 'westbrook-d', priority: 'high', title: 'FNOL needs photos — Westbrook collision claim', subtitle: 'Claim #CLM-2026-44871 · adjuster Rita Park awaiting upload', tag: 'claim', tag_label: 'Claim', time_label: '5h', href: '/claims' },
    { slug: 'crestline-bakery', priority: 'med', title: 'UW referral — Crestline Bakery commercial package', subtitle: '$48K premium · awaiting underwriter response on fire suppression', tag: 'policy', tag_label: 'UW', time_label: '1d', href: '/underwriting-hub' },
    { slug: 'patel-household', priority: 'med', title: 'Term life follow-up — Patel family (cross-sell)', subtitle: 'Quoted $750K 20-year term · client requested call this afternoon', tag: 'lead', tag_label: 'Lead', time_label: '2h', href: '/sales-pipeline' },
    { slug: 'donovan-m', priority: 'med', title: 'NSF on autopay — Donovan auto policy', subtitle: 'Policy POL-AU-882103 · grace period ends May 6', tag: 'policy', tag_label: 'Billing', time_label: '1d', href: '/billing' },
    { slug: 'olsen-r', priority: 'low', title: 'Endorsement pending signature — Olsen home policy', subtitle: 'Added detached garage · DocuSign sent April 27', tag: 'policy', tag_label: 'Policy', time_label: '2d', href: '/endorsements' },
    { slug: 'yamamoto-k', priority: 'low', title: 'Renewal review — Yamamoto umbrella ($2M)', subtitle: 'Auto-renews May 15 · client unchanged · standard re-quote ready', tag: 'renewal', tag_label: 'Renewal', time_label: '4d', href: '/renewals' },
  ];

  for (let i = 0; i < queue.length; i++) {
    const q = queue[i];
    const custId = await cid(client, q.slug);
    await client.query(
      `INSERT INTO action_queue (customer_id, priority, title, subtitle, tag, tag_label, time_label, href, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [custId, q.priority, q.title, q.subtitle, q.tag, q.tag_label, q.time_label, q.href, i]
    );
  }

  // ── PIPELINE DEALS ──
  const deals = [
    // Prospect
    { slug: 'walsh-family', stage: 'prospect', age_label: '6d', detail: 'Home purchase life event detected · first-time buyer · pre-qualified', line_type: 'home', premium: 2400, deal_score: 72 },
    { slug: 'okonkwo-a', stage: 'prospect', age_label: '3d', detail: 'Marriage trigger · personal lines bundle opportunity · auto+home+umbrella', line_type: 'bundle', premium: 3100, deal_score: 68 },
    // Quoted
    { slug: 'patel-household', stage: 'quoted', age_label: '12d', detail: 'Term life cross-sell · $750K 20-year · client requested afternoon call', line_type: 'life', premium: 1180, deal_score: 81 },
    { slug: 'crestline-bakery', stage: 'quoted', age_label: '8d', detail: 'Cyber liability add-on · new TX product · existing BOP client', line_type: 'commercial', premium: 4200, deal_score: 74 },
    { slug: 'henderson-t', stage: 'quoted', age_label: '5d', detail: 'Teen driver add · parent is existing auto policyholder · good driver discount eligible', line_type: 'auto', premium: 1640, deal_score: 65 },
    { slug: 'park-j', stage: 'quoted', age_label: '4d', detail: 'Renters → homeowners conversion · closing on property May 8', line_type: 'home', premium: 1890, deal_score: 78 },
    // Proposal
    { slug: 'nguyen-construction', stage: 'proposal', age_label: '14d', detail: 'Commercial GL + workers comp · 22 employees · fleet of 8 vehicles', line_type: 'commercial', premium: 28400, deal_score: 83 },
    { slug: 'donovan-m', stage: 'proposal', age_label: '7d', detail: 'Umbrella upsell $1M → $2M · triggered by new boat purchase', line_type: 'umbrella', premium: 380, deal_score: 88 },
    { slug: 'yamamoto-k', stage: 'proposal', age_label: '9d', detail: 'Umbrella renewal + life cross-sell · existing client · renews May 15', line_type: 'bundle', premium: 2100, deal_score: 71 },
    // Negotiation
    { slug: 'martinez-auto-group', stage: 'negotiation', age_label: '18d', detail: 'Commercial fleet · 14 vehicles · multi-location · awaiting loss runs from prior carrier', line_type: 'commercial', premium: 42600, deal_score: 76 },
    { slug: 'chen-l', stage: 'negotiation', age_label: '22d', detail: 'Investment property package · duplex · stalled on price — competing Allstate quote received', line_type: 'home', premium: 3200, deal_score: 62, is_at_risk: true, at_risk_label: 'At risk · stalled 8 days' },
    // Won
    { slug: 'reeves-household', stage: 'won', age_label: 'Bound', detail: 'Auto + home bundle · new-to-book · referred by Donovan', line_type: 'bundle', premium: 3480, deal_score: 94, is_won: true, won_label: 'Bound April 22' },
  ];

  for (let i = 0; i < deals.length; i++) {
    const d = deals[i];
    const custId = await cid(client, d.slug);
    await client.query(
      `INSERT INTO pipeline_deals (customer_id, stage, age_label, detail, line_type, premium, deal_score, is_at_risk, at_risk_label, is_won, won_label, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [custId, d.stage, d.age_label, d.detail, d.line_type, d.premium, d.deal_score, d.is_at_risk || false, d.at_risk_label || null, d.is_won || false, d.won_label || null, i]
    );
  }

  // ── BOOK OF BUSINESS ROWS ──
  const bookRows = [
    // Personal auto
    { slug: 'ramirez-household', detail: 'Carlos & Elena · 5 policies', premium: 8640, policy_count: 5, tenure_display: '7yr', cross_sell_score: 92, retention_score: 62, group_key: 'personal_auto', lines: ['auto', 'home'] },
    { slug: 'henderson-t', detail: 'Good driver · teen add pending', premium: 1580, policy_count: 1, tenure_display: '4yr', cross_sell_score: 68, retention_score: 87, group_key: 'personal_auto', lines: ['auto'] },
    { slug: 'kim-s', detail: '2 claims in 24mo · Progressive signal', premium: 1420, policy_count: 1, tenure_display: '3yr', cross_sell_score: 42, retention_score: 58, group_key: 'personal_auto', lines: ['auto'] },
    { slug: 'torres-a', detail: 'Clean record · rate hold', premium: 1180, policy_count: 1, tenure_display: '5yr', cross_sell_score: 55, retention_score: 93, group_key: 'personal_auto', lines: ['auto'] },
    { slug: 'westbrook-d', detail: 'Active collision claim pending', premium: 2040, policy_count: 1, tenure_display: '2yr', cross_sell_score: 38, retention_score: 79, group_key: 'personal_auto', lines: ['auto'] },
    // Homeowners
    { slug: 'patel-household', detail: 'Recently re-quoted · bundled', premium: 3880, policy_count: 3, tenure_display: '6yr', cross_sell_score: 85, retention_score: 89, group_key: 'homeowners', lines: ['auto', 'home'] },
    { slug: 'reeves-household', detail: 'New-to-book · referred by Donovan', premium: 3480, policy_count: 2, tenure_display: '1mo', cross_sell_score: 80, retention_score: 90, group_key: 'homeowners', lines: ['auto', 'home'] },
    { slug: 'olsen-r', detail: 'Garage endorsement processed', premium: 2340, policy_count: 1, tenure_display: '3yr', cross_sell_score: 52, retention_score: 83, group_key: 'homeowners', lines: ['home'] },
    { slug: 'walsh-family', detail: 'First-time homebuyer · new policy', premium: 2100, policy_count: 1, tenure_display: '1yr', cross_sell_score: 35, retention_score: 84, group_key: 'homeowners', lines: ['home'] },
    // Commercial
    { slug: 'martinez-auto-group', detail: 'Fleet · 14 vehicles · multi-location', premium: 42600, policy_count: 3, tenure_display: '5yr', cross_sell_score: 62, retention_score: 66, group_key: 'commercial', lines: ['commercial'] },
    { slug: 'nguyen-construction', detail: 'GL + workers comp · 22 employees', premium: 28400, policy_count: 2, tenure_display: '4yr', cross_sell_score: 58, retention_score: 76, group_key: 'commercial', lines: ['commercial'] },
    { slug: 'crestline-bakery', detail: 'BOP + WC · cyber add-on quoted', premium: 46100, policy_count: 2, tenure_display: '6yr', cross_sell_score: 65, retention_score: 74, group_key: 'commercial', lines: ['commercial'] },
    { slug: 'greenfield-dental', detail: 'BOP + prof liability · expanding', premium: 12400, policy_count: 2, tenure_display: '3yr', cross_sell_score: 58, retention_score: 71, group_key: 'commercial', lines: ['commercial'] },
    // Life & umbrella
    { slug: 'okonkwo-a', detail: 'Level term · $500K · 20yr', premium: 840, policy_count: 1, tenure_display: '2yr', cross_sell_score: 30, retention_score: 95, group_key: 'life_umbrella', lines: ['life'] },
    { slug: 'yamamoto-k', detail: 'Personal umbrella · $2M limit', premium: 620, policy_count: 1, tenure_display: '4yr', cross_sell_score: 48, retention_score: 91, group_key: 'life_umbrella', lines: ['umbrella'] },
    { slug: 'dawson-k', detail: 'Auto+home+umbrella · long-term', premium: 2800, policy_count: 3, tenure_display: '8yr', cross_sell_score: 92, retention_score: 85, group_key: 'life_umbrella', lines: ['bundle'] },
  ];

  for (let i = 0; i < bookRows.length; i++) {
    const r = bookRows[i];
    const custId = await cid(client, r.slug);
    const { rows } = await client.query(
      `INSERT INTO book_rows (customer_id, detail, premium, policy_count, tenure_display, cross_sell_score, retention_score, group_key, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [custId, r.detail, r.premium, r.policy_count, r.tenure_display, r.cross_sell_score, r.retention_score, r.group_key, i]
    );
    for (let j = 0; j < r.lines.length; j++) {
      await client.query(
        'INSERT INTO book_row_lines (row_id, line_type, sort_order) VALUES ($1,$2,$3)',
        [rows[0].id, r.lines[j], j]
      );
    }
  }

  console.log(`Seeded: ${queue.length} action queue items, ${deals.length} pipeline deals, ${bookRows.length} book rows.`);
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
