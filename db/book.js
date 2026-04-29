const pool = require('./pool');

async function getBookRows() {
  const { rows } = await pool.query(`
    SELECT
      b.id AS row_id, b.detail, b.premium, b.policy_count, b.tenure_display,
      b.cross_sell_score, b.retention_score, b.group_key,
      c.name AS customer_name, c.slug
    FROM book_rows b
    JOIN customers c ON c.id = b.customer_id
    ORDER BY b.group_key, b.sort_order
  `);

  const rowIds = rows.map((r) => r.row_id);
  if (rowIds.length === 0) return {};

  const { rows: lineRows } = await pool.query(
    `SELECT row_id, line_type FROM book_row_lines
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

module.exports = { getBookRows };
