const pool = require('./pool');

async function getCustomerBySlug(slug) {
  const { rows } = await pool.query(
    'SELECT * FROM customers WHERE slug = $1',
    [slug]
  );
  return rows[0] || null;
}

async function getPolicies(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM policies WHERE customer_id = $1 ORDER BY sort_order',
    [customerId]
  );
  return rows;
}

async function getHouseholdMembers(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM household_members WHERE customer_id = $1 ORDER BY sort_order',
    [customerId]
  );
  return rows;
}

async function getTimelineEvents(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM timeline_events WHERE customer_id = $1 ORDER BY sort_order',
    [customerId]
  );
  return rows;
}

async function getRetentionFactors(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM retention_factors WHERE customer_id = $1 ORDER BY sort_order',
    [customerId]
  );
  return rows;
}

async function getOpportunities(customerId) {
  const { rows } = await pool.query(
    'SELECT * FROM opportunities WHERE customer_id = $1 ORDER BY sort_order',
    [customerId]
  );
  return rows;
}

async function getFullProfile(slug) {
  const customer = await getCustomerBySlug(slug);
  if (!customer) return null;

  const [policies, members, events, factors, opportunities] = await Promise.all([
    getPolicies(customer.id),
    getHouseholdMembers(customer.id),
    getTimelineEvents(customer.id),
    getRetentionFactors(customer.id),
    getOpportunities(customer.id),
  ]);

  return { customer, policies, members, events, factors, opportunities };
}

module.exports = { getCustomerBySlug, getFullProfile };
