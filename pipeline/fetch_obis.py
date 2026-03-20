"""
Step 1: Fetch species checklist from OBIS for the central Chile dive zone.
Queries per diver-relevant phylum to avoid fetching 40K+ microorganisms.
"""

import json
import os
import time
import urllib.parse
import urllib.request

from dive_sites import get_max_dive_depth, get_wkt_polygon

OBIS_API = "https://api.obis.org/v3"

# Query per phylum to keep requests manageable
DIVER_PHYLA = [
    ("Chordata", "fish_and_vertebrates"),
    ("Mollusca", "mollusks"),
    ("Arthropoda", "crustaceans"),
    ("Echinodermata", "echinoderms"),
    ("Cnidaria", "cnidarians"),
    ("Porifera", "sponges"),
    ("Annelida", "worms"),
    ("Ochrophyta", "algae"),
    ("Rhodophyta", "algae"),
    ("Chlorophyta", "algae"),
]


def fetch_checklist(geometry: str, taxon_name: str, size: int = 500, after: str | None = None) -> dict:
    """Fetch a page of the OBIS checklist filtered by taxon."""
    params = {
        "geometry": geometry,
        "scientificname": taxon_name,
        "size": str(size),
    }
    if after:
        params["after"] = after

    url = f"{OBIS_API}/checklist?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def fetch_phylum_species(geometry: str, phylum: str) -> list[dict]:
    """Fetch all species for a given phylum in the geometry."""
    all_species = []
    after = None
    page = 0

    while True:
        page += 1
        data = fetch_checklist(geometry, phylum, size=500, after=after)
        results = data.get("results", [])
        if not results:
            break

        all_species.extend(results)

        after = results[-1].get("taxonID") if results else None
        if len(results) < 500:
            break

        time.sleep(0.3)

    return all_species


def normalize_species(raw: dict, category: str) -> dict:
    """Normalize an OBIS checklist record into our schema."""
    return {
        "obis_taxon_id": raw.get("taxonID"),
        "aphia_id": raw.get("acceptedNameUsageID") or raw.get("taxonID"),
        "scientific_name": raw.get("acceptedNameUsage") or raw.get("scientificName", ""),
        "species": raw.get("species", ""),
        "genus": raw.get("genus", ""),
        "family": raw.get("family", ""),
        "order": raw.get("order", ""),
        "class": raw.get("class", ""),
        "phylum": raw.get("phylum", ""),
        "kingdom": raw.get("kingdom", ""),
        "records": raw.get("records", 0),
        "category": category,
    }


def main():
    geometry = get_wkt_polygon(buffer_deg=0.15)
    max_depth = get_max_dive_depth()

    print(f"=== OBIS Species Fetch (per-phylum) ===")
    print(f"Geometry: {geometry[:80]}...")
    print(f"Max dive depth: {max_depth}m")
    print()

    all_normalized = []

    for phylum, category in DIVER_PHYLA:
        print(f"Fetching {phylum}...", end=" ", flush=True)
        raw = fetch_phylum_species(geometry, phylum)
        print(f"{len(raw)} raw", end="")

        normalized = [normalize_species(sp, category) for sp in raw]
        # Keep only species-level records
        normalized = [sp for sp in normalized if sp["species"]]
        print(f" → {len(normalized)} species-level")

        all_normalized.extend(normalized)
        time.sleep(0.5)

    # Deduplicate by scientific name
    seen = set()
    unique = []
    for sp in all_normalized:
        key = sp["scientific_name"] or sp["species"]
        if key and key not in seen:
            seen.add(key)
            unique.append(sp)

    # Sort by record count (most observed first)
    unique.sort(key=lambda x: x["records"], reverse=True)

    print(f"\n=== Results ===")
    print(f"Total species-level: {len(all_normalized)}")
    print(f"Unique species: {len(unique)}")

    # Summary by category
    print(f"\n=== By Category ===")
    cats = {}
    for sp in unique:
        cat = sp["category"]
        cats[cat] = cats.get(cat, 0) + 1
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    # Save
    output = {
        "metadata": {
            "source": "OBIS",
            "geometry": geometry,
            "max_depth_m": max_depth,
            "total_filtered": len(unique),
            "fetch_date": time.strftime("%Y-%m-%d"),
        },
        "species": unique,
    }

    os.makedirs("data", exist_ok=True)
    output_path = "data/obis_species.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(unique)} species to {output_path}")


if __name__ == "__main__":
    main()
