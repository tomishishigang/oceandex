"""
Step 3: Fetch images from iNaturalist for each species.
Uses the iNaturalist API to find CC-licensed observation photos.
"""

import json
import time
import urllib.parse
import urllib.request

INAT_API = "https://api.inaturalist.org/v1"


def search_inaturalist(scientific_name: str, max_results: int = 3) -> list[dict]:
    """Search iNaturalist for observation photos of a species."""
    params = {
        "taxon_name": scientific_name,
        "place_id": 7190,  # Chile
        "quality_grade": "research",
        "photos": "true",
        "per_page": str(max_results),
        "order": "desc",
        "order_by": "votes",
    }
    url = f"{INAT_API}/observations?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(url, headers={
            "Accept": "application/json",
            "User-Agent": "Oceandex/1.0 (marine species PWA)",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("results", [])
    except Exception as e:
        print(f"    iNaturalist error: {e}")
        return []


def extract_photos(observations: list[dict]) -> list[dict]:
    """Extract photo URLs and licenses from observations."""
    photos = []
    for obs in observations:
        for photo in obs.get("photos", []):
            license_code = photo.get("license_code")
            # Only use CC-licensed photos
            if license_code and license_code.startswith("cc"):
                photos.append({
                    "url_square": photo.get("url", "").replace("square", "square"),
                    "url_small": photo.get("url", "").replace("square", "small"),
                    "url_medium": photo.get("url", "").replace("square", "medium"),
                    "url_large": photo.get("url", "").replace("square", "large"),
                    "url_original": photo.get("url", "").replace("square", "original"),
                    "license": license_code,
                    "attribution": photo.get("attribution", ""),
                    "observation_id": obs.get("id"),
                    "observer": obs.get("user", {}).get("login", ""),
                })
                if len(photos) >= 3:
                    return photos
    return photos


def fetch_taxon_info(scientific_name: str) -> dict | None:
    """Get iNaturalist taxon info including default photo."""
    params = {"q": scientific_name, "per_page": "1"}
    url = f"{INAT_API}/taxa?{urllib.parse.urlencode(params)}"

    try:
        req = urllib.request.Request(url, headers={
            "Accept": "application/json",
            "User-Agent": "Oceandex/1.0 (marine species PWA)",
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            results = data.get("results", [])
            if results:
                taxon = results[0]
                return {
                    "inat_taxon_id": taxon.get("id"),
                    "inat_name": taxon.get("preferred_common_name"),
                    "wikipedia_url": taxon.get("wikipedia_url"),
                    "default_photo": taxon.get("default_photo"),
                    "observations_count": taxon.get("observations_count", 0),
                    "iconic_taxon_name": taxon.get("iconic_taxon_name"),
                }
    except Exception as e:
        print(f"    iNaturalist taxon error: {e}")
    return None


def enrich_with_images(species: dict) -> dict:
    """Add iNaturalist images and taxon info to a species."""
    name = species.get("scientific_name") or species.get("species")
    if not name:
        return species

    # Get taxon info (includes Wikipedia link, default photo)
    taxon = fetch_taxon_info(name)
    if taxon:
        species["inat"] = taxon
        # Use iNat common name as fallback
        if not species.get("common_name_en") and taxon.get("inat_name"):
            species["common_name_en"] = taxon["inat_name"]

    time.sleep(0.5)

    # Get observation photos from Chile
    observations = search_inaturalist(name, max_results=5)
    photos = extract_photos(observations)
    species["photos"] = photos

    return species


def main():
    input_path = "data/species_enriched.json"
    output_path = "data/species_with_images.json"

    with open(input_path) as f:
        data = json.load(f)

    species_list = data["species"]
    total = len(species_list)
    print(f"=== iNaturalist Image Enrichment ===")
    print(f"Processing {total} species...")
    print()

    for i, sp in enumerate(species_list):
        name = sp.get("scientific_name") or sp.get("species")
        print(f"[{i+1}/{total}] {name}")
        enrich_with_images(sp)

        has_photos = len(sp.get("photos", [])) > 0
        has_taxon = sp.get("inat") is not None
        status = "✓" if has_photos else "✗"
        print(f"    {status} photos: {len(sp.get('photos', []))} | taxon: {has_taxon}")

        time.sleep(0.5)  # Rate limit

    with_photos = sum(1 for s in species_list if s.get("photos"))
    with_taxon = sum(1 for s in species_list if s.get("inat"))
    print(f"\nWith photos: {with_photos}/{total}")
    print(f"With taxon info: {with_taxon}/{total}")

    output = {
        "metadata": {
            **data["metadata"],
            "images_enriched": True,
            "images_date": time.strftime("%Y-%m-%d"),
        },
        "species": species_list,
    }

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Saved to {output_path}")


if __name__ == "__main__":
    main()
