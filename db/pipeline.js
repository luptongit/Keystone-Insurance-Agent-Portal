const pool = require('./pool');

async function getPipelineDeals() {
  const { rows } = await pool.query(`
    SELECT
      d.stage, d.age_label, d.detail, d.line_type, d.premium, d.deal_score,
      d.is_at_risk, d.at_risk_label, d.is_won, d.won_label,
      c.name AS customer_name, c.slug
    FROM pipeline_deals d
    JOIN customers c ON c.id = d.customer_id
    ORDER BY d.sort_order
  `);

  const stages = {};
  for (const d of rows) {
    (stages[d.stage] ||= []).push(d);
  }

  return stages;
}

module.exports = { getPipelineDeals };
