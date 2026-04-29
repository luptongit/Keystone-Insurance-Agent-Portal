-- Extend customers with 360 detail fields
ALTER TABLE customers ADD COLUMN location VARCHAR(120);
ALTER TABLE customers ADD COLUMN client_since VARCHAR(40);
ALTER TABLE customers ADD COLUMN member_count INTEGER;
ALTER TABLE customers ADD COLUMN lifetime_value VARCHAR(20);
ALTER TABLE customers ADD COLUMN tier VARCHAR(20);
ALTER TABLE customers ADD COLUMN email VARCHAR(120);
ALTER TABLE customers ADD COLUMN phone VARCHAR(20);
ALTER TABLE customers ADD COLUMN preferred_contact VARCHAR(60);
ALTER TABLE customers ADD COLUMN language VARCHAR(40);
ALTER TABLE customers ADD COLUMN retention_detail_score INTEGER;

-- Individual policies (Customer 360 policies panel)
CREATE TABLE IF NOT EXISTS policies (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  policy_number   VARCHAR(20) NOT NULL,
  line_type       VARCHAR(20) NOT NULL,
  title           VARCHAR(120) NOT NULL,
  subtitle        VARCHAR(200),
  premium         INTEGER NOT NULL DEFAULT 0,
  payment_freq    VARCHAR(40),
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  status_label    VARCHAR(40),
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Policies page rows (customer-level policy activity summaries)
CREATE TABLE IF NOT EXISTS policy_page_rows (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  detail          VARCHAR(200),
  policy_number   VARCHAR(20),
  premium         INTEGER NOT NULL DEFAULT 0,
  effective_date  VARCHAR(20),
  expiration_date VARCHAR(20),
  status          VARCHAR(20) NOT NULL DEFAULT 'active',
  row_style       VARCHAR(20),
  group_key       VARCHAR(40) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS policy_page_row_lines (
  id              SERIAL PRIMARY KEY,
  row_id          INTEGER NOT NULL REFERENCES policy_page_rows(id) ON DELETE CASCADE,
  line_type       VARCHAR(20) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Renewals
CREATE TABLE IF NOT EXISTS renewals (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  detail          VARCHAR(200),
  current_premium INTEGER NOT NULL,
  renewal_premium INTEGER NOT NULL,
  change_pct      NUMERIC(5,1) NOT NULL DEFAULT 0,
  change_dir      VARCHAR(10) NOT NULL DEFAULT 'up',
  renewal_date    VARCHAR(10) NOT NULL,
  date_urgency    VARCHAR(10),
  retention_score INTEGER,
  status          VARCHAR(20) NOT NULL,
  is_at_risk      BOOLEAN NOT NULL DEFAULT false,
  group_key       VARCHAR(20) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS renewal_lines (
  id              SERIAL PRIMARY KEY,
  renewal_id      INTEGER NOT NULL REFERENCES renewals(id) ON DELETE CASCADE,
  line_type       VARCHAR(20) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Household members (Customer 360)
CREATE TABLE IF NOT EXISTS household_members (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name            VARCHAR(80) NOT NULL,
  initials        VARCHAR(4) NOT NULL,
  relationship    VARCHAR(40),
  detail          VARCHAR(120),
  avatar_class    CHAR(1),
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Timeline events (Customer 360)
CREATE TABLE IF NOT EXISTS timeline_events (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type      VARCHAR(20) NOT NULL,
  event_time      VARCHAR(20) NOT NULL,
  title           VARCHAR(120) NOT NULL,
  detail          VARCHAR(300),
  attribution     VARCHAR(80),
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Retention factors (Customer 360)
CREATE TABLE IF NOT EXISTS retention_factors (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label           VARCHAR(60) NOT NULL,
  value           VARCHAR(40) NOT NULL,
  sentiment       VARCHAR(10) NOT NULL DEFAULT 'neutral',
  sort_order      INTEGER NOT NULL DEFAULT 0
);

-- Opportunities (Customer 360)
CREATE TABLE IF NOT EXISTS opportunities (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title           VARCHAR(80) NOT NULL,
  description     VARCHAR(300) NOT NULL,
  confidence      INTEGER,
  icon_svg        TEXT,
  meta_left       VARCHAR(60),
  meta_right      VARCHAR(40),
  sort_order      INTEGER NOT NULL DEFAULT 0
);
