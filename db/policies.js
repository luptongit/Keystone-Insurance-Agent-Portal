const pool = require('./pool');

async function getPolicyPageRows() {
  const { rows } = await pool.query(`
    SELECT
      r.id AS row_id, r.detail, r.policy_number, r.premium,
      r.effective_date, r.expiration_date, r.status, r.row_style, r.group_key,
      c.slug, c.name AS customer_name
    FROM policy_page_rows r
    JOIN customers c ON c.id = r.customer_id
    ORDER BY r.group_key, r.sort_order
  `);

  const rowIds = rows.map((r) => r.row_id);
  if (rowIds.length === 0) return {};

  const { rows: lineRows } = await pool.query(
    `SELECT row_id, line_type FROM policy_page_row_lines
     WHERE row_id = ANY($1) ORDER BY sort_order`,
    [rowIds]
  );

  const linesByRow = {};
  for (const l of lineRows) {
    (linesByRow[l.row_id] ||= []).push(l.line_type);
  }

  const enriched = rows.map((r) => ({
    ...r,
    lines: linesByRow[r.row_id] || [],
  }));

  const groups = {};
  for (const r of enriched) {
    (groups[r.group_key] ||= []).push(r);
  }

  return groups;
}

module.exports = { getPolicyPageRows };
