#!/usr/bin/env python3
"""Export oceandex_dataset.json to a CSV for manual review.
Includes ALL species with sightability scores and a v1 recommendation flag.
"""

import csv
import json
from collections import Counter
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
INPUT = DATA_DIR / "oceandex_dataset.json"
OUTPUT = DATA_DIR / "oceandex_review.csv"

COLUMNS = [
    "recommended_v1",
    "sightability_score",
    "sightability_tier",
    "scientific_name",
    "common_name_en",
    "common_name_es",
    "category",
    "has_photo",
    "photo_url",
    "phylum",
    "class",
    "order",
    "family",
    "genus",
    "observation_count",
    "inat_observations",
    "wikipedia_url",
    "id",
]


def main():
    with open(INPUT, encoding="utf-8") as f:
        dataset = json.load(f)

    species_list = dataset["species"]

    # Sort by sightability score descending
    species_list.sort(key=lambda s: -(s.get("sightability_score", 0)))

    rows = []
    for sp in species_list:
        photo = sp.get("primary_photo") or {}
        photo_url = photo.get("url_medium", "")
        has_photo = "yes" if photo_url else "no"

        score = sp.get("sightability_score", 0)
        tier = sp.get("sightability_tier", "")

        # Recommended for v1: has photo AND common/uncommon tier
        recommended = has_photo == "yes" and tier in ("common", "uncommon")

        rows.append({
            "recommended_v1": "YES" if recommended else "",
            "sightability_score": score,
            "sightability_tier": tier,
            "scientific_name": sp.get("scientific_name", ""),
            "common_name_en": sp.get("common_name_en", ""),
            "common_name_es": sp.get("common_name_es", ""),
            "category": sp.get("category", ""),
            "has_photo": has_photo,
            "photo_url": photo_url,
            "phylum": sp.get("phylum", ""),
            "class": sp.get("class", ""),
            "order": sp.get("order", ""),
            "family": sp.get("family", ""),
            "genus": sp.get("genus", ""),
            "observation_count": sp.get("observation_count", 0),
            "inat_observations": sp.get("inat_observations", ""),
            "wikipedia_url": sp.get("wikipedia_url", ""),
            "id": sp.get("id", ""),
        })

    with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    # --- Summary ---
    total = len(rows)
    print(f"Exported {total} rows to {OUTPUT}")
    print(f"Sorted by sightability score (highest first)\n")

    cats = Counter(r["category"] for r in rows)
    print("By category:")
    for cat, count in sorted(cats.items()):
        print(f"  {cat}: {count}")

    with_photo = sum(1 for r in rows if r["has_photo"] == "yes")
    with_en = sum(1 for r in rows if r["common_name_en"])
    with_es = sum(1 for r in rows if r["common_name_es"])
    recommended = sum(1 for r in rows if r["recommended_v1"] == "YES")

    tiers = Counter(r["sightability_tier"] for r in rows)
    print(f"\nBy tier:")
    for tier in ["common", "uncommon", "rare", "unlikely"]:
        print(f"  {tier}: {tiers.get(tier, 0)}")

    print(f"\nWith photos:    {with_photo}/{total}")
    print(f"With EN name:   {with_en}/{total}")
    print(f"With ES name:   {with_es}/{total}")
    print(f"Recommended v1: {recommended}/{total}")


if __name__ == "__main__":
    main()
