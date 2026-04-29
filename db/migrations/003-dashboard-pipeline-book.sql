-- Dashboard action queue
CREATE TABLE IF NOT EXISTS action_queue (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  priority    VARCHAR(10) NOT NULL DEFAULT 'med',
  title       VARCHAR(200) NOT NULL,
  subtitle    VARCHAR(200),
  tag         VARCHAR(20) NOT NULL,
  tag_label   VARCHAR(20) NOT NULL,
  time_label  VARCHAR(10) NOT NULL,
  href        VARCHAR(120) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Sales pipeline deals
CREATE TABLE IF NOT EXISTS pipeline_deals (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stage       VARCHAR(20) NOT NULL,
  age_label   VARCHAR(10) NOT NULL,
  detail      VARCHAR(200) NOT NULL,
  line_type   VARCHAR(20) NOT NULL,
  premium     INTEGER NOT NULL DEFAULT 0,
  deal_score  INTEGER,
  is_at_risk  BOOLEAN NOT NULL DEFAULT false,
  at_risk_label VARCHAR(60),
  is_won      BOOLEAN NOT NULL DEFAULT false,
  won_label   VARCHAR(60),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- Book of business rows
CREATE TABLE IF NOT EXISTS book_rows (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  detail          VARCHAR(200),
  premium         INTEGER NOT NULL DEFAULT 0,
  policy_count    INTEGER NOT NULL DEFAULT 0,
  tenure_display  VARCHAR(10),
  cross_sell_score INTEGER,
  retention_score INTEGER,
  group_key       VARCHAR(40) NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_row_lines (
  id          SERIAL PRIMARY KEY,
  row_id      INTEGER NOT NULL REFERENCES book_rows(id) ON DELETE CASCADE,
  line_type   VARCHAR(20) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
