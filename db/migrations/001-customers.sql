-- Customers schema

CREATE TABLE IF NOT EXISTS customers (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(80) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  initials      VARCHAR(4) NOT NULL,
  customer_type VARCHAR(20) NOT NULL DEFAULT 'household',
  detail        VARCHAR(200),
  premium       INTEGER NOT NULL DEFAULT 0,
  policy_count  INTEGER NOT NULL DEFAULT 0,
  tenure_display VARCHAR(10),
  retention_score INTEGER,
  avatar_style  VARCHAR(20),
  group_key     VARCHAR(40) NOT NULL DEFAULT 'personal',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_lines (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  line_type   VARCHAR(20) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_signal_dots (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  color       VARCHAR(10) NOT NULL,
  tooltip     VARCHAR(120),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_alerts (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  flag_type   VARCHAR(20) NOT NULL,
  is_urgent   BOOLEAN NOT NULL DEFAULT false,
  meta        VARCHAR(200),
  action_text VARCHAR(60) NOT NULL DEFAULT 'Review →',
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_alert_signals (
  id          SERIAL PRIMARY KEY,
  alert_id    INTEGER NOT NULL REFERENCES customer_alerts(id) ON DELETE CASCADE,
  signal_text VARCHAR(200) NOT NULL,
  is_warn     BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_alert_lines (
  id          SERIAL PRIMARY KEY,
  alert_id    INTEGER NOT NULL REFERENCES customer_alerts(id) ON DELETE CASCADE,
  line_type   VARCHAR(20) NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version     INTEGER PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
