---
name: workout-chart
description: Query the database for every workout from the past year and export a bar chart image of workouts per month. Use when the user asks for a workout chart, workouts per month, a yearly workout summary, training frequency over the last year, or an exported image/graph of workout counts.
---

# Workout Chart

Counts rows in the `workouts` table (by `started_at`) for the last 12 months and saves a bar chart as a PNG: months on the x axis, number of workouts on the y axis.

## Run

```bash
pip install matplotlib "psycopg[binary]" python-dotenv   # first time only
python .claude/skills/workout-chart/scripts/workout_chart.py [output.png]
```

- Default output: `workouts-per-month.png` in the current directory.
- The script reads `DATABASE_URL` from `.env`, falling back to `.env.local` (this project keeps it in `.env.local`), searching from the current directory. Never print or echo the connection string.
- Months with no workouts show as 0 so the x axis is continuous.
- It counts workouts for **all users** (the whole table), not just one Clerk user. Add `AND user_id = %s` to the query in the script if a single user's chart is wanted.
- The query is read-only (a single `SELECT`).

## Files

- `scripts/workout_chart.py`: the script.
- `references/api_reference.md`: arguments, env vars, table columns, the exact query, and how to change the window or filter by user.
- `assets/example_asset.txt`: sample console output and the data/appearance of the expected chart.

After running, tell the user the image path and read the image to confirm it rendered.
