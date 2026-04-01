# Local Product Stack

This runbook starts the new Giaan Khand product stack locally with:

- PostgreSQL on `54329`
- Typesense on `8108`
- Fastify API on `4100`
- Next.js web app on `3001`

It assumes:

- `Node 22`
- `pnpm`
- Homebrew PostgreSQL tools available locally: `initdb`, `pg_ctl`, `createdb`
- internet access for the first Typesense download

## One-time install

```bash
pnpm install
```

## Start local services

```bash
./scripts/start-local-postgres.sh
./scripts/start-local-typesense.sh
```

## Load the archive into the product stack

This uses the built archive SQLite at `dist/archive/archive.sqlite`.

```bash
./scripts/load-product-data.sh
```

## Start the apps

```bash
./scripts/start-product-apps.sh
```

Then open:

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:4100](http://localhost:4100)
- OpenAPI: [http://localhost:4100/openapi.json](http://localhost:4100/openapi.json)

## Useful checks

```bash
curl http://127.0.0.1:4100/health
curl 'http://127.0.0.1:4100/v1/search/pangtis?q=dkg&limit=1'
curl http://127.0.0.1:8108/health
```

## Notes

- The API uses `4100` in this runbook to avoid a common collision with other local services on `4000`.
- `scripts/load-product-data.sh` is idempotent at the row level because the importer upserts into the Postgres read model.
- Typesense data and the temporary Postgres cluster are stored under `.tmp/`.
