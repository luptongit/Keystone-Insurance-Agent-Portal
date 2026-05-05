-- Customer 360 tab content: claims, billing, documents, notes

CREATE TABLE IF NOT EXISTS customer_claims (
  id           SERIAL PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  claim_number VARCHAR(20) NOT NULL,
  claim_date   VARCHAR(20) NOT NULL,
  claim_type   VARCHAR(40) NOT NULL,
  description  VARCHAR(200),
  amount       INTEGER,
  status       VARCHAR(20) NOT NULL DEFAULT 'open',
  adjuster     VARCHAR(60),
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_billing (
  id           SERIAL PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  txn_date     VARCHAR(20) NOT NULL,
  description  VARCHAR(120) NOT NULL,
  amount       INTEGER NOT NULL,
  txn_type     VARCHAR(20) NOT NULL DEFAULT 'payment',
  method       VARCHAR(40),
  status       VARCHAR(20) NOT NULL DEFAULT 'completed',
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_documents (
  id           SERIAL PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  doc_type     VARCHAR(40) NOT NULL,
  title        VARCHAR(120) NOT NULL,
  doc_date     VARCHAR(20) NOT NULL,
  file_size    VARCHAR(10),
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customer_notes (
  id           SERIAL PRIMARY KEY,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  author       VARCHAR(60) NOT NULL,
  note_date    VARCHAR(20) NOT NULL,
  content      VARCHAR(400) NOT NULL,
  note_type    VARCHAR(20) NOT NULL DEFAULT 'note',
  sort_order   INTEGER NOT NULL DEFAULT 0
);
