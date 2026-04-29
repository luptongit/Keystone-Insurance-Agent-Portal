const pool = require('./pool');

async function getAlerts() {
  const { rows: alerts } = await pool.query(`
    SELECT
      a.id AS alert_id, a.flag_type, a.is_urgent, a.meta, a.action_text,
      c.slug, c.name, c.initials
    FROM customer_alerts a
    JOIN customers c ON c.id = a.customer_id
    ORDER BY a.sort_order
  `);

  const alertIds = alerts.map((a) => a.alert_id);
  if (alertIds.length === 0) return [];

  const [signalRes, lineRes] = await Promise.all([
    pool.query(
      `SELECT alert_id, signal_text, is_warn
       FROM customer_alert_signals
       WHERE alert_id = ANY($1)
       ORDER BY sort_order`,
      [alertIds]
    ),
    pool.query(
      `SELECT alert_id, line_type
       FROM customer_alert_lines
       WHERE alert_id = ANY($1)
       ORDER BY sort_order`,
      [alertIds]
    ),
  ]);

  const signalsByAlert = {};
  for (const s of signalRes.rows) {
    (signalsByAlert[s.alert_id] ||= []).push(s);
  }

  const linesByAlert = {};
  for (const l of lineRes.rows) {
    (linesByAlert[l.alert_id] ||= []).push(l.line_type);
  }

  return alerts.map((a) => ({
    ...a,
    signals: signalsByAlert[a.alert_id] || [],
    lines: linesByAlert[a.alert_id] || [],
  }));
}

async function getTableCustomers() {
  const { rows: customers } = await pool.query(`
    SELECT
      id, slug, name, initials, detail, premium, policy_count,
      tenure_display, retention_score, avatar_style, group_key
    FROM customers
    WHERE group_key IN ('top_accounts', 'personal')
    ORDER BY group_key, sort_order
  `);

  const customerIds = customers.map((c) => c.id);
  if (customerIds.length === 0) return { top_accounts: [], personal: [] };

  const [lineRes, dotRes] = await Promise.all([
    pool.query(
      `SELECT customer_id, line_type
       FROM customer_lines
       WHERE customer_id = ANY($1)
       ORDER BY sort_order`,
      [customerIds]
    ),
    pool.query(
      `SELECT customer_id, color, tooltip
       FROM customer_signal_dots
       WHERE customer_id = ANY($1)
       ORDER BY sort_order`,
      [customerIds]
    ),
  ]);

  const linesByCustomer = {};
  for (const l of lineRes.rows) {
    (linesByCustomer[l.customer_id] ||= []).push(l.line_type);
  }

  const dotsByCustomer = {};
  for (const d of dotRes.rows) {
    (dotsByCustomer[d.customer_id] ||= []).push(d);
  }

  const enriched = customers.map((c) => ({
    ...c,
    lines: linesByCustomer[c.id] || [],
    signals: dotsByCustomer[c.id] || [],
  }));

  return {
    top_accounts: enriched.filter((c) => c.group_key === 'top_accounts'),
    personal: enriched.filter((c) => c.group_key === 'personal'),
  };
}

module.exports = { getAlerts, getTableCustomers };
