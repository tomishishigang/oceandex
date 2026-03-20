"""
Estimate sightability score for each species.
Combines multiple signals to predict how likely a diver is to see each species.

Signals:
  1. iNaturalist observations in Chile (best proxy - citizen science / diver photos)
  2. OBIS record count (scientific surveys)
  3. Depth range from iNaturalist/FishBase (0-40m = diveable)
  4. Whether species has photos (proxy for "visible to humans")
  5. Taxonomic group penalties (parasites, planktonic copepods, deep-sea)

Output: sightability score 0-100 and a tier (common / uncommon / rare / unlikely)
"""

import json
import math
import time
import urllib.parse
import urllib.request

INAT_API = "https://api.inaturalist.org/v1"

# Depth limits for recreational diving
MAX_DIVE_DEPTH = 40  # meters


def fetch_inat_depth_info(taxon_id: int) -> dict | None:
    """Get depth/habitat info from iNaturalist taxon details."""
    # We can't get depth directly from iNat, but we can check
    # if observations exist in shallow water near our dive sites
    return None  # iNat doesn't have depth data per taxon


def compute_sightability(species: dict) -> dict:
    """Compute sightability score for a species."""
    scores = {}

    # --- Signal 1: iNaturalist observation count (0-40 points) ---
    # This is the strongest signal - if divers photograph it, divers see it
    inat_obs = species.get("inat_observations", 0)
    if inat_obs >= 100:
        scores["inat"] = 40
    elif inat_obs >= 50:
        scores["inat"] = 35
    elif inat_obs >= 20:
        scores["inat"] = 30
    elif inat_obs >= 10:
        scores["inat"] = 25
    elif inat_obs >= 5:
        scores["inat"] = 20
    elif inat_obs >= 1:
        scores["inat"] = 10
    else:
        scores["inat"] = 0

    # --- Signal 2: OBIS record count (0-20 points) ---
    obis_records = species.get("observation_count", 0)
    if obis_records >= 50:
        scores["obis"] = 20
    elif obis_records >= 20:
        scores["obis"] = 15
    elif obis_records >= 5:
        scores["obis"] = 10
    elif obis_records >= 1:
        scores["obis"] = 5
    else:
        scores["obis"] = 0

    # --- Signal 3: Has photos (0-10 points) ---
    # Species with photos are more likely visible to divers
    has_photo = species.get("primary_photo") is not None
    scores["photo"] = 10 if has_photo else 0

    # --- Signal 4: Has common name (0-10 points) ---
    # Well-known species have common names
    has_name = bool(species.get("common_name_en") or species.get("common_name_es"))
    scores["name"] = 10 if has_name else 0

    # --- Signal 5: Taxonomic penalties (-20 to +20 points) ---
    family = (species.get("family") or "").lower()
    order = (species.get("order") or "").lower()
    cls = (species.get("class") or "").lower()
    phylum = (species.get("phylum") or "").lower()
    category = species.get("category", "")

    # Positive: groups divers love seeing
    diver_favorites = {
        "nudibranchia": 15,      # Nudibranchs
        "octopoda": 15,          # Octopus
        "decapoda": 5,           # Crabs, lobsters, shrimp (visible ones)
        "perciformes": 5,        # Most reef fish
        "scorpaeniformes": 10,   # Scorpionfish, rockfish
        "rajiformes": 10,        # Rays
        "carcharhiniformes": 15, # Sharks
        "cetacea": 10,           # Whales, dolphins
        "asteroidea": 10,        # Sea stars
        "echinoidea": 10,        # Sea urchins
    }

    # Negative: groups divers don't/can't see
    diver_unlikely = {
        "copepoda": -25,         # Parasitic/planktonic copepods
        "ostracoda": -20,        # Microscopic
        "amphipoda": -15,        # Mostly tiny
        "isopoda": -10,          # Mostly small
        "pycnogonida": -10,      # Sea spiders (rare sightings)
        "sipuncula": -15,        # Peanut worms (buried)
    }

    taxon_bonus = 0
    for taxon_key, bonus in diver_favorites.items():
        if taxon_key in order or taxon_key in cls:
            taxon_bonus = max(taxon_bonus, bonus)

    for taxon_key, penalty in diver_unlikely.items():
        if taxon_key in order or taxon_key in cls:
            taxon_bonus = min(taxon_bonus, penalty)

    # Parasitic families
    parasitic_families = [
        "caligidae", "lernaeopodidae", "pennellidae", "chondracanthidae",
        "hatschekiidae", "trebiidae",
    ]
    if family in parasitic_families:
        taxon_bonus = -25

    # Worms penalty (most are buried/hidden)
    if category == "worms":
        taxon_bonus = min(taxon_bonus, -10)

    # Sponges (visible but not exciting, slight penalty)
    if category == "sponges":
        taxon_bonus = min(taxon_bonus, 0)

    scores["taxon"] = taxon_bonus

    # --- Total score ---
    raw_score = sum(scores.values())
    # Clamp to 0-100
    final_score = max(0, min(100, raw_score))

    # --- Tier assignment ---
    if final_score >= 60:
        tier = "common"
    elif final_score >= 40:
        tier = "uncommon"
    elif final_score >= 20:
        tier = "rare"
    else:
        tier = "unlikely"

    return {
        "sightability_score": final_score,
        "sightability_tier": tier,
        "sightability_signals": scores,
    }


def main():
    input_path = "data/oceandex_dataset.json"
    output_path = "data/oceandex_dataset.json"
    csv_path = "data/oceandex_review.csv"

    with open(input_path) as f:
        data = json.load(f)

    species_list = data["species"]
    total = len(species_list)
    print(f"=== Sightability Scoring ===")
    print(f"Scoring {total} species...")

    # Score all species
    for sp in species_list:
        result = compute_sightability(sp)
        sp.update(result)

    # Sort by score descending
    species_list.sort(key=lambda x: x["sightability_score"], reverse=True)

    # Stats
    tiers = {}
    for sp in species_list:
        tier = sp["sightability_tier"]
        tiers[tier] = tiers.get(tier, 0) + 1

    print(f"\n=== Tier Distribution ===")
    for tier in ["common", "uncommon", "rare", "unlikely"]:
        count = tiers.get(tier, 0)
        pct = count * 100 // total
        print(f"  {tier:12s}: {count:3d} ({pct}%)")

    print(f"\n=== Top 30 Most Sightable ===")
    for sp in species_list[:30]:
        name = sp.get("common_name_es") or sp.get("common_name_en") or sp["scientific_name"]
        sci = sp["scientific_name"]
        score = sp["sightability_score"]
        tier = sp["sightability_tier"]
        print(f"  [{score:3d}] {tier:10s} | {name:35s} ({sci})")

    print(f"\n=== Bottom 10 (least sightable) ===")
    for sp in species_list[-10:]:
        name = sp.get("scientific_name")
        score = sp["sightability_score"]
        tier = sp["sightability_tier"]
        cat = sp["category"]
        print(f"  [{score:3d}] {tier:10s} | {name:40s} ({cat})")

    # Category breakdown
    print(f"\n=== Average Score by Category ===")
    cat_scores = {}
    for sp in species_list:
        cat = sp["category"]
        if cat not in cat_scores:
            cat_scores[cat] = []
        cat_scores[cat].append(sp["sightability_score"])
    for cat, scores_list in sorted(cat_scores.items(), key=lambda x: -sum(x[1])/len(x[1])):
        avg = sum(scores_list) / len(scores_list)
        print(f"  {cat:25s}: avg={avg:.0f}  (n={len(scores_list)})")

    # Save updated dataset
    data["metadata"]["sightability_scored"] = True
    data["metadata"]["sightability_date"] = time.strftime("%Y-%m-%d")
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"\nSaved scored dataset to {output_path}")

    # Update CSV
    import csv
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "sightability_score", "sightability_tier",
            "scientific_name", "common_name_en", "common_name_es",
            "category", "phylum", "class", "order", "family",
            "has_photo", "inat_observations", "observation_count",
            "wikipedia_url",
        ])
        for sp in species_list:
            writer.writerow([
                sp.get("sightability_score", 0),
                sp.get("sightability_tier", ""),
                sp.get("scientific_name", ""),
                sp.get("common_name_en", ""),
                sp.get("common_name_es", ""),
                sp.get("category", ""),
                sp.get("phylum", ""),
                sp.get("class", ""),
                sp.get("order", ""),
                sp.get("family", ""),
                "yes" if sp.get("primary_photo") else "no",
                sp.get("inat_observations", 0),
                sp.get("observation_count", 0),
                sp.get("wikipedia_url", ""),
            ])
    print(f"Updated CSV at {csv_path}")

    # Recommendation
    recommended = sum(1 for sp in species_list if sp["sightability_tier"] in ("common", "uncommon"))
    print(f"\n=== Recommendation ===")
    print(f"For v1 of the app, include 'common' + 'uncommon' tiers: {recommended} species")
    print(f"This filters out {total - recommended} species that divers are unlikely to see.")


if __name__ == "__main__":
    main()
