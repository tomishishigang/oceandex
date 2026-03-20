"""
Step 2b: Enrich common names from multiple sources.
Sources (in priority order):
  1. iNaturalist (locale=es for Spanish, default for English)
  2. GBIF vernacular names API
  3. WoRMS vernacular names (retry for species that failed)

This step is designed to be re-run — it only queries for species missing names.
"""

import json
import os
import time
import urllib.parse
import urllib.request

INAT_API = "https://api.inaturalist.org/v1"
GBIF_API = "https://api.gbif.org/v1"
WORMS_API = "https://www.marinespecies.org/rest"


def inat_search_taxon(scientific_name: str, locale: str = "en") -> dict | None:
    """Search iNaturalist for a taxon and get its common name in the given locale."""
    params = {"q": scientific_name, "per_page": "1", "locale": locale}
    url = f"{INAT_API}/taxa?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={
            "Accept": "application/json",
            "User-Agent": "Oceandex/1.0",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            results = data.get("results", [])
            if results:
                taxon = results[0]
                return {
                    "name": taxon.get("preferred_common_name"),
                    "english_name": taxon.get("english_common_name"),
                }
    except Exception:
        pass
    return None


def gbif_search_species(scientific_name: str) -> int | None:
    """Find a GBIF species key by scientific name."""
    params = {"name": scientific_name, "limit": "1"}
    url = f"{GBIF_API}/species?{urllib.parse.urlencode(params)}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            results = data.get("results", [])
            if results:
                return results[0].get("key")
    except Exception:
        pass
    return None


def gbif_vernacular_names(species_key: int) -> dict:
    """Get vernacular names from GBIF for a species key."""
    url = f"{GBIF_API}/species/{species_key}/vernacularNames?limit=100"
    names = {"en": None, "es": None}
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            for entry in data.get("results", []):
                lang = entry.get("language", "")
                name = entry.get("vernacularName", "")
                if lang == "eng" and not names["en"]:
                    names["en"] = name
                elif lang == "spa" and not names["es"]:
                    names["es"] = name
                if names["en"] and names["es"]:
                    break
    except Exception:
        pass
    return names


def worms_vernacular_names(aphia_id: int) -> dict:
    """Get vernacular names from WoRMS."""
    names = {"en": None, "es": None}
    try:
        aphia_id = int(str(aphia_id).split(":")[-1])
    except (ValueError, IndexError):
        return names

    url = f"{WORMS_API}/AphiaVernacularsByAphiaID/{aphia_id}"
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                for v in data:
                    lang = v.get("language_code", "")
                    name = v.get("vernacular", "")
                    if lang == "eng" and not names["en"]:
                        names["en"] = name
                    elif lang == "spa" and not names["es"]:
                        names["es"] = name
                    if names["en"] and names["es"]:
                        break
    except Exception:
        pass
    return names


def enrich_common_names(species: dict) -> dict:
    """Try multiple sources to fill in missing common names."""
    name = species.get("scientific_name") or species.get("species")
    if not name:
        return species

    need_en = not species.get("common_name_en")
    need_es = not species.get("common_name_es")

    if not need_en and not need_es:
        return species

    # Source 1: iNaturalist (Spanish)
    if need_es:
        result = inat_search_taxon(name, locale="es")
        if result and result.get("name"):
            species["common_name_es"] = result["name"]
            need_es = False
        # Also grab English if we need it
        if need_en and result and result.get("english_name"):
            species["common_name_en"] = result["english_name"]
            need_en = False
        time.sleep(0.3)

    # Source 1b: iNaturalist (English) if still needed
    if need_en:
        result = inat_search_taxon(name, locale="en")
        if result and result.get("name"):
            species["common_name_en"] = result["name"]
            need_en = False
        time.sleep(0.3)

    # Source 2: GBIF vernacular names
    if need_en or need_es:
        gbif_key = gbif_search_species(name)
        if gbif_key:
            time.sleep(0.2)
            gbif_names = gbif_vernacular_names(gbif_key)
            if need_en and gbif_names["en"]:
                species["common_name_en"] = gbif_names["en"]
                need_en = False
            if need_es and gbif_names["es"]:
                species["common_name_es"] = gbif_names["es"]
                need_es = False
            time.sleep(0.2)

    # Source 3: WoRMS (only if still missing and we have an aphia_id)
    if (need_en or need_es) and species.get("aphia_id"):
        worms_names = worms_vernacular_names(species["aphia_id"])
        if need_en and worms_names["en"]:
            species["common_name_en"] = worms_names["en"]
            need_en = False
        if need_es and worms_names["es"]:
            species["common_name_es"] = worms_names["es"]
            need_es = False
        time.sleep(0.3)

    return species


def main():
    input_path = "data/species_with_images.json"
    output_path = "data/species_with_images.json"  # Update in-place

    with open(input_path) as f:
        data = json.load(f)

    species_list = data["species"]
    total = len(species_list)

    # Count what's missing
    missing_en = sum(1 for s in species_list if not s.get("common_name_en"))
    missing_es = sum(1 for s in species_list if not s.get("common_name_es"))
    print(f"=== Common Names Enrichment ===")
    print(f"Total species: {total}")
    print(f"Missing English: {missing_en}")
    print(f"Missing Spanish: {missing_es}")
    print()

    found_en = 0
    found_es = 0

    for i, sp in enumerate(species_list):
        had_en = bool(sp.get("common_name_en"))
        had_es = bool(sp.get("common_name_es"))

        if had_en and had_es:
            continue

        name = sp.get("scientific_name") or sp.get("species")
        print(f"[{i+1}/{total}] {name}", end="", flush=True)

        enrich_common_names(sp)

        got_en = bool(sp.get("common_name_en")) and not had_en
        got_es = bool(sp.get("common_name_es")) and not had_es
        if got_en:
            found_en += 1
        if got_es:
            found_es += 1

        status_parts = []
        if got_en:
            status_parts.append(f"EN: {sp['common_name_en']}")
        if got_es:
            status_parts.append(f"ES: {sp['common_name_es']}")
        if status_parts:
            print(f" -> {' | '.join(status_parts)}")
        else:
            print(" -> (no names found)")

    # Final stats
    final_en = sum(1 for s in species_list if s.get("common_name_en"))
    final_es = sum(1 for s in species_list if s.get("common_name_es"))
    print(f"\n=== Results ===")
    print(f"English names: {final_en}/{total} ({final_en*100//total}%) [+{found_en} new]")
    print(f"Spanish names: {final_es}/{total} ({final_es*100//total}%) [+{found_es} new]")

    data["metadata"]["names_enriched"] = True
    data["metadata"]["names_date"] = time.strftime("%Y-%m-%d")

    with open(output_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
