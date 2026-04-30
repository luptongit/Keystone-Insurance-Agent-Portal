const pool = require('./pool');

async function search(query) {
  const q = `%${query}%`;

  const [customers, policies, pipeline] = await Promise.all([
    pool.query(
      `SELECT name, detail, slug, customer_type
       FROM customers
       WHERE name ILIKE $1 OR detail ILIKE $1
       ORDER BY name
       LIMIT 5`,
      [q]
    ),
    pool.query(
      `SELECT p.policy_number, p.title, p.status, c.slug
       FROM policies p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.policy_number ILIKE $1 OR p.title ILIKE $1
       ORDER BY p.policy_number
       LIMIT 5`,
      [q]
    ),
    pool.query(
      `SELECT c.name AS customer_name, d.detail, d.stage, c.slug
       FROM pipeline_deals d
       JOIN customers c ON c.id = d.customer_id
       WHERE d.detail ILIKE $1 OR c.name ILIKE $1
       ORDER BY d.sort_order
       LIMIT 5`,
      [q]
    ),
  ]);

  return {
    customers: customers.rows,
    policies: policies.rows,
    pipeline: pipeline.rows,
  };
}

module.exports = { search };
