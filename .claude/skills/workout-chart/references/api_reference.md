# Workout Chart Reference

## Command

```bash
python .claude/skills/workout-chart/scripts/workout_chart.py [output.png]
```

| Argument | Default | Meaning |
| --- | --- | --- |
| `output.png` | `workouts-per-month.png` | Path of the exported image (any format matplotlib supports, chosen by extension). |

Exit codes: `0` on success; non-zero with a message if `DATABASE_URL` is missing or the connection/query fails.

## Configuration

| Variable | Source | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Environment, `.env`, then `.env.local` | Postgres (Neon) connection string. This project keeps it in `.env.local`. Never print it. |

## Dependencies

```bash
pip install matplotlib "psycopg[binary]" python-dotenv
```

## Data source

Table `workouts` (see `src/db/schema.ts`):

| Column | Type | Used |
| --- | --- | --- |
| `id` | uuid | |
| `user_id` | text (Clerk user id) | not filtered; counts all users |
| `name` | text | |
| `started_at` | timestamp | yes: bucketed by month |
| `completed_at` | timestamp, nullable | no: in-progress workouts are counted too |

Query (read-only):

```sql
SELECT date_trunc('month', started_at)::date AS month, count(*)
FROM workouts
WHERE started_at >= date_trunc('month', now()) - interval '11 months'
GROUP BY 1
```

The window is the current month plus the previous 11. Months with no rows are filled in with 0 in Python so the x axis is always 12 bars.

## Common changes

- **One user only:** add `AND user_id = %s` to the query and pass the Clerk user id as a parameter.
- **Completed workouts only:** add `AND completed_at IS NOT NULL`.
- **Different window:** change `interval '11 months'` and the `range(12)` in `last_12_months`.

See `assets/example_asset.txt` for a sample run and the expected chart.
