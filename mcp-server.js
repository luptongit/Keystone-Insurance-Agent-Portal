const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const searchDb = require('./db/search');
const customer360Db = require('./db/customer360');
const customerDb = require('./db/customers');
const policyDb = require('./db/policies');
const renewalDb = require('./db/renewals');
const pipelineDb = require('./db/pipeline');
const bookDb = require('./db/book');
const dashboardDb = require('./db/dashboard');

const server = new McpServer({
  name: 'keystone-insurance',
  version: '0.1.0',
});

function json(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

server.tool(
  'search',
  'Search across customers, policies, and pipeline deals by keyword',
  { query: z.string().describe('Search term (min 2 characters)') },
  async ({ query }) => {
    if (query.trim().length < 2) return json({ error: 'Query must be at least 2 characters' });
    return json(await searchDb.search(query));
  }
);

server.tool(
  'get_customer_profile',
  'Get full Customer 360 profile: policies, household, timeline, retention factors, opportunities, claims, billing, documents, and notes',
  { slug: z.string().describe('Customer URL slug, e.g. "anderson-family"') },
  async ({ slug }) => {
    const profile = await customer360Db.getFullProfile(slug);
    if (!profile) return json({ error: `No customer found with slug "${slug}"` });
    return json(profile);
  }
);

server.tool(
  'list_customers',
  'List all customers grouped by segment (top accounts and personal lines)',
  {},
  async () => json(await customerDb.getTableCustomers())
);

server.tool(
  'get_customer_alerts',
  'Get active customer alerts with risk signals and affected lines of business',
  {},
  async () => json(await customerDb.getAlerts())
);

server.tool(
  'list_policies',
  'List all policies grouped by status (active, pending, expiring)',
  {},
  async () => json(await policyDb.getPolicyPageRows())
);

server.tool(
  'list_renewals',
  'List upcoming renewals with premium changes, retention scores, and at-risk flags',
  {},
  async () => json(await renewalDb.getRenewalRows())
);

server.tool(
  'get_pipeline',
  'Get sales pipeline deals organized by stage (prospect, quoted, negotiation, won)',
  {},
  async () => json(await pipelineDb.getPipelineDeals())
);

server.tool(
  'get_book_of_business',
  'Get book of business rows with cross-sell scores and retention metrics',
  {},
  async () => json(await bookDb.getBookRows())
);

server.tool(
  'get_dashboard',
  'Get the agent dashboard: priority action queue and renewals due this week',
  {},
  async () => {
    const [queue, renewingThisWeek] = await Promise.all([
      dashboardDb.getActionQueue(),
      dashboardDb.getRenewingThisWeek(),
    ]);
    return json({ queue, renewingThisWeek });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
