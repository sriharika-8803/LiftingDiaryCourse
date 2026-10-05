"""Export a bar chart (workouts per month, past 12 months) from the workouts table."""

import os
import sys
from datetime import date

import matplotlib

matplotlib.use("Agg")  # headless: write a file, never open a window
import matplotlib.pyplot as plt
import psycopg
from dotenv import load_dotenv

# One row per month that has workouts; months with none are filled in with 0 below.
QUERY = """
    SELECT date_trunc('month', started_at)::date AS month, count(*)
    FROM workouts
    WHERE started_at >= date_trunc('month', now()) - interval '11 months'
    GROUP BY 1
"""


def last_12_months(today: date) -> list[date]:
    months = []
    year, month = today.year, today.month
    for _ in range(12):
        months.append(date(year, month, 1))
        year, month = (year - 1, 12) if month == 1 else (year, month - 1)
    return months[::-1]


def main() -> None:
    out = sys.argv[1] if len(sys.argv) > 1 else "workouts-per-month.png"

    load_dotenv(".env")
    load_dotenv(".env.local")  # does not override values already set
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL not found in the environment, .env or .env.local")

    with psycopg.connect(url) as conn:
        counts = {month: n for month, n in conn.execute(QUERY).fetchall()}

    months = last_12_months(date.today())
    values = [counts.get(m, 0) for m in months]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar([m.strftime("%b %Y") for m in months], values, color="#2563eb")
    ax.bar_label(bars)
    ax.set_title("Workouts per month (past year)")
    ax.set_xlabel("Month")
    ax.set_ylabel("Number of workouts")
    ax.yaxis.get_major_locator().set_params(integer=True)
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right")
    fig.tight_layout()
    fig.savefig(out, dpi=150)
    print(f"Saved {out} ({sum(values)} workouts)")


if __name__ == "__main__":
    main()
