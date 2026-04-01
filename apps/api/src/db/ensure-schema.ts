import type { Pool } from 'pg'

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS product_works (
  id text PRIMARY KEY,
  slug text NOT NULL,
  title jsonb NOT NULL,
  translation jsonb,
  classification text NOT NULL,
  text_shape text NOT NULL,
  summary jsonb,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS product_structure_nodes (
  id text PRIMARY KEY,
  work_id text NOT NULL REFERENCES product_works(id),
  parent_id text,
  slug text NOT NULL,
  node_type text NOT NULL,
  title jsonb NOT NULL,
  translation jsonb,
  description jsonb,
  position integer NOT NULL,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS product_passages (
  id text PRIMARY KEY,
  work_id text NOT NULL REFERENCES product_works(id),
  structure_node_id text NOT NULL REFERENCES product_structure_nodes(id),
  slug text NOT NULL,
  passage_type text NOT NULL,
  position integer NOT NULL,
  reference text,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS product_passage_texts (
  id text PRIMARY KEY,
  passage_id text NOT NULL REFERENCES product_passages(id),
  witness_id text NOT NULL,
  slug text NOT NULL,
  content_role text NOT NULL,
  language_code text,
  script_code text,
  body text NOT NULL,
  position integer NOT NULL,
  page integer,
  page_start integer,
  page_end integer,
  folio text,
  folio_start text,
  folio_end text,
  local_index integer,
  unit_start integer,
  unit_end integer,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS product_work_slug_index
  ON product_works (slug);

CREATE INDEX IF NOT EXISTS product_structure_node_slug_index
  ON product_structure_nodes (slug);

CREATE INDEX IF NOT EXISTS product_structure_node_work_parent_position_index
  ON product_structure_nodes (work_id, parent_id, position);

CREATE INDEX IF NOT EXISTS product_passage_slug_index
  ON product_passages (slug);

CREATE INDEX IF NOT EXISTS product_passage_node_position_index
  ON product_passages (structure_node_id, position);

CREATE INDEX IF NOT EXISTS product_passage_work_position_index
  ON product_passages (work_id, position);

CREATE INDEX IF NOT EXISTS product_passage_text_slug_index
  ON product_passage_texts (slug);

CREATE INDEX IF NOT EXISTS product_passage_text_passage_position_index
  ON product_passage_texts (passage_id, position);

CREATE INDEX IF NOT EXISTS product_passage_text_role_position_index
  ON product_passage_texts (content_role, script_code, position);

CREATE INDEX IF NOT EXISTS product_passage_text_page_range_index
  ON product_passage_texts (page_start, page_end);
`

export const ensureProductSchema = async (pool: Pool) => {
  await pool.query(SCHEMA_SQL)
}
