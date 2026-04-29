const pool = require('./pool');

async function getRenewalRows() {
  const { rows } = await pool.query(`
    SELECT
      r.id AS renewal_id, r.detail, r.current_premium, r.renewal_premium,
      r.change_pct, r.change_dir, r.renewal_date, r.date_urgency,
      r.retention_score, r.status, r.is_at_risk, r.group_key,
      c.slug, c.name AS customer_name
    FROM renewals r
    JOIN customers c ON c.id = r.customer_id
    ORDER BY r.group_key, r.sort_order
  `);

  const renewalIds = rows.map((r) => r.renewal_id);
  if (renewalIds.length === 0) return {};

  const { rows: lineRows } = await pool.query(
    `SELECT renewal_id, line_type FROM renewal_lines
     WHERE renewal_id = ANY($1) ORDER BY sort_order`,
    [renewalIds]
  );

  const linesByRenewal = {};
  for (const l of lineRows) {
    (linesByRenewal[l.renewal_id] ||= []).push(l.line_type);
  }

  const enriched = rows.map((r) => ({
    ...r,
    lines: linesByRenewal[r.renewal_id] || [],
  }));

  const groups = {};
  for (const r of enriched) {
    (groups[r.group_key] ||= []).push(r);
  }

  return groups;
}

module.exports = { getRenewalRows };
