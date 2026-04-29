const pool = require('./pool');

async function getActionQueue() {
  const { rows } = await pool.query(`
    SELECT
      a.priority, a.title, a.subtitle, a.tag, a.tag_label, a.time_label, a.href,
      c.slug
    FROM action_queue a
    LEFT JOIN customers c ON c.id = a.customer_id
    ORDER BY a.sort_order
  `);
  return rows;
}

async function getRenewingThisWeek() {
  const { rows } = await pool.query(`
    SELECT
      r.current_premium, r.detail,
      c.name AS customer_name, c.slug
    FROM renewals r
    JOIN customers c ON c.id = r.customer_id
    WHERE r.group_key = 'this_week'
    ORDER BY r.sort_order
  `);
  return rows;
}

module.exports = { getActionQueue, getRenewingThisWeek };
