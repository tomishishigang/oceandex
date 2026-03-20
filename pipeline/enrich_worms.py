"""
Step 2: Enrich species data with WoRMS (World Register of Marine Species).
Adds: common names, taxonomic authority, habitat info.
"""

import json
import time
import urllib.parse
import urllib.request

WORMS_API = "https://www.marinespecies.org/rest"


def fetch_worms_record(aphia_id: int) -> dict | None:
    """Fetch a single species record from WoRMS by AphiaID."""
    url = f"{WORMS_API}/AphiaRecordByAphiaID/{aphia_id}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode())
    except Exception as e:
        print(f"    WoRMS record error for {aphia_id}: {e}")
    return None


def fetch_common_names(aphia_id: int) -> list[dict]:
    """Fetch vernacular (common) names for a species."""
    url = f"{WORMS_API}/AphiaVernacularsByAphiaID/{aphia_id}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode())
    except Exception:
        pass
    return []


def extract_common_names(vernaculars: list[dict]) -> dict:
    """Extract Spanish and English common names."""
    names = {"en": None, "es": None}
    for v in vernaculars:
        lang = v.get("language_code", "")
        name = v.get("vernacular", "")
        if lang == "eng" and not names["en"]:
            names["en"] = name
        elif lang == "spa" and not names["es"]:
            names["es"] = name
    return names


def enrich_species(species: dict) -> dict:
    """Add WoRMS data to a species record."""
    aphia_id = species.get("aphia_id")
    if not aphia_id:
        return species

    try:
        aphia_id = int(str(aphia_id).split(":")[-1])
    except (ValueError, IndexError):
        return species

    # Fetch WoRMS record
    record = fetch_worms_record(aphia_id)
    if record:
        species["worms"] = {
            "aphia_id": record.get("AphiaID"),
            "scientific_name": record.get("scientificname"),
            "authority": record.get("authority"),
            "status": record.get("status"),
            "is_marine": record.get("isMarine"),
            "is_brackish": record.get("isBrackish"),
        }

    # Fetch common names
    vernaculars = fetch_common_names(aphia_id)
    names = extract_common_names(vernaculars)
    species["common_name_en"] = names["en"]
    species["common_name_es"] = names["es"]

    return species


def main():
    input_path = "data/obis_species.json"
    output_path = "data/species_enriched.json"

    with open(input_path) as f:
        data = json.load(f)

    species_list = data["species"]
    total = len(species_list)
    print(f"=== WoRMS Enrichment ===")
    print(f"Enriching {total} species...")
    print()

    enriched = []
    for i, sp in enumerate(species_list):
        name = sp.get("scientific_name") or sp.get("species")
        print(f"[{i+1}/{total}] {name}")

        enriched_sp = enrich_species(sp)
        enriched.append(enriched_sp)

        # Rate limit: WoRMS asks for max ~1 req/sec
        time.sleep(0.4)

    # Stats
    with_en = sum(1 for s in enriched if s.get("common_name_en"))
    with_es = sum(1 for s in enriched if s.get("common_name_es"))
    print(f"\nWith English name: {with_en}/{total}")
    print(f"With Spanish name: {with_es}/{total}")

    output = {
        "metadata": {
            **data["metadata"],
            "worms_enriched": True,
            "enrichment_date": time.strftime("%Y-%m-%d"),
        },
        "species": enriched,
    }

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
