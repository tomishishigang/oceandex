"""
Step 4: Final dataset builder.
Merges all enriched data into the final Oceandex species dataset.
Produces both a full JSON and a lightweight summary.
"""

import json
import time

from dive_sites import DIVE_SITES


def build_species_entry(sp: dict) -> dict:
    """Build a clean, final species entry for the app."""
    # Pick best photo
    primary_photo = None
    if sp.get("inat", {}).get("default_photo"):
        dp = sp["inat"]["default_photo"]
        primary_photo = {
            "url_medium": dp.get("medium_url"),
            "url_square": dp.get("square_url"),
            "attribution": dp.get("attribution", ""),
            "license": dp.get("license_code", ""),
        }
    elif sp.get("photos"):
        p = sp["photos"][0]
        primary_photo = {
            "url_medium": p.get("url_medium"),
            "url_square": p.get("url_square"),
            "attribution": p.get("attribution", ""),
            "license": p.get("license", ""),
        }

    # Additional photos
    additional_photos = []
    for p in sp.get("photos", [])[:3]:
        additional_photos.append({
            "url_medium": p.get("url_medium"),
            "url_square": p.get("url_square"),
            "attribution": p.get("attribution", ""),
            "license": p.get("license", ""),
        })

    return {
        # Identity
        "id": sp.get("aphia_id"),
        "scientific_name": sp.get("scientific_name") or sp.get("species"),
        "common_name_en": sp.get("common_name_en"),
        "common_name_es": sp.get("common_name_es"),

        # Taxonomy
        "kingdom": sp.get("kingdom"),
        "phylum": sp.get("phylum"),
        "class": sp.get("class"),
        "order": sp.get("order"),
        "family": sp.get("family"),
        "genus": sp.get("genus"),
        "species": sp.get("species"),

        # Diver category
        "category": sp.get("category"),

        # Data quality
        "observation_count": sp.get("records", 0),
        "inat_observations": sp.get("inat", {}).get("observations_count", 0),

        # Images
        "primary_photo": primary_photo,
        "additional_photos": additional_photos,

        # Links
        "wikipedia_url": sp.get("inat", {}).get("wikipedia_url"),
        "worms_authority": sp.get("worms", {}).get("authority"),
    }


def main():
    input_path = "data/species_with_images.json"
    output_full = "data/oceandex_dataset.json"
    output_summary = "data/oceandex_summary.json"

    with open(input_path) as f:
        data = json.load(f)

    species_list = data["species"]
    print(f"=== Building Oceandex Dataset ===")
    print(f"Input: {len(species_list)} species")

    # Build final entries
    entries = []
    for sp in species_list:
        entry = build_species_entry(sp)
        entries.append(entry)

    # Sort: species with photos first, then by observation count
    entries.sort(key=lambda x: (
        x["primary_photo"] is not None,
        x["observation_count"] + x["inat_observations"],
    ), reverse=True)

    # Full dataset
    dataset = {
        "metadata": {
            "name": "Oceandex - Central Chile Marine Species",
            "version": "1.0.0",
            "build_date": time.strftime("%Y-%m-%d"),
            "region": "Central Chile (Valparaíso / Coquimbo)",
            "latitude_range": "-33.5 to -32.0",
            "longitude_range": "-71.9 to -71.3",
            "total_species": len(entries),
            "with_photos": sum(1 for e in entries if e["primary_photo"]),
            "with_common_name_en": sum(1 for e in entries if e["common_name_en"]),
            "with_common_name_es": sum(1 for e in entries if e["common_name_es"]),
            "data_sources": ["OBIS", "WoRMS", "iNaturalist"],
        },
        "dive_sites": DIVE_SITES,
        "species": entries,
    }

    with open(output_full, "w") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    print(f"Full dataset: {output_full} ({len(entries)} species)")

    # Summary (no photos, for quick loading)
    summary_entries = []
    for e in entries:
        summary_entries.append({
            "id": e["id"],
            "scientific_name": e["scientific_name"],
            "common_name_en": e["common_name_en"],
            "common_name_es": e["common_name_es"],
            "category": e["category"],
            "phylum": e["phylum"],
            "family": e["family"],
            "has_photo": e["primary_photo"] is not None,
            "observation_count": e["observation_count"],
        })

    summary = {
        "metadata": dataset["metadata"],
        "species": summary_entries,
    }

    with open(output_summary, "w") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"Summary: {output_summary}")

    # Print stats
    print(f"\n=== Dataset Stats ===")
    cats = {}
    for e in entries:
        cat = e["category"]
        cats[cat] = cats.get(cat, 0) + 1
    for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

    print(f"\nTop 20 most observed species:")
    for e in entries[:20]:
        photo = "📷" if e["primary_photo"] else "  "
        name_en = e["common_name_en"] or ""
        print(f"  {photo} {e['scientific_name']:<40} {name_en:<30} ({e['observation_count']} obs)")


if __name__ == "__main__":
    main()
