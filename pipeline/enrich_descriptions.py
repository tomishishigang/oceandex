"""
Generate diver-friendly species descriptions using Claude API.
Reads the dataset, generates descriptions for recommended species,
and saves them back.

Usage: python3 enrich_descriptions.py
"""

import json
import os
import time
import urllib.request

DATASET_PATH = "data/oceandex_dataset.json"
ANTHROPIC_API = "https://api.anthropic.com/v1/messages"


def get_api_key():
    """Get Anthropic API key from environment."""
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("Set ANTHROPIC_API_KEY environment variable")
    return key


def generate_description(species: dict, api_key: str) -> dict:
    """Generate a diver-friendly description for a species using Claude."""
    sci_name = species.get("scientific_name", "")
    common_es = species.get("common_name_es", "")
    common_en = species.get("common_name_en", "")
    category = species.get("category", "")
    phylum = species.get("phylum", "")
    cls = species.get("class", "")
    order = species.get("order", "")
    family = species.get("family", "")
    tags = species.get("sightability_tier", "")
    score = species.get("sightability_score", 0)

    prompt = f"""Generate a short, diver-friendly species description for a marine species identification app used by recreational divers in central Chile (Valparaíso region).

Species: {sci_name}
Common name (Spanish): {common_es or 'N/A'}
Common name (English): {common_en or 'N/A'}
Category: {category}
Taxonomy: {phylum} > {cls} > {order} > {family}
Sightability: {tags} (score: {score}/100)

Write TWO descriptions (Spanish and English), each 2-3 sentences max. Focus on:
- What it looks like (color, size, distinguishing features)
- Where a diver would find it (depth, habitat type)
- Any interesting behavior or fun fact

Keep it conversational, not scientific. A recreational diver should understand everything.

Respond in this exact JSON format only, no other text:
{{"description_es": "...", "description_en": "...", "size_cm": null, "depth_range_m": "...", "habitat": "..."}}

For size_cm, give the typical adult size as a number (or null if unknown).
For depth_range_m, give a range like "5-30" (or null if unknown).
For habitat, give a short phrase in English like "Rocky reefs, kelp forests"."""

    body = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 400,
        "messages": [{"role": "user", "content": prompt}],
    }).encode()

    req = urllib.request.Request(
        ANTHROPIC_API,
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode())
            text = result["content"][0]["text"].strip()
            # Parse JSON from response
            return json.loads(text)
    except Exception as e:
        print(f"    Error: {e}")
        return None


def main():
    api_key = get_api_key()

    with open(DATASET_PATH) as f:
        data = json.load(f)

    species_list = data["species"]
    recommended = [
        s for s in species_list
        if s.get("primary_photo")
        and s.get("sightability_tier") in ("common", "uncommon")
    ]

    print(f"=== Species Description Generator ===")
    print(f"Total species: {len(species_list)}")
    print(f"Recommended (to describe): {len(recommended)}")
    print()

    # Track which already have descriptions
    already_done = sum(1 for s in recommended if s.get("description_es"))
    print(f"Already have descriptions: {already_done}")
    to_do = [s for s in recommended if not s.get("description_es")]
    print(f"Need descriptions: {len(to_do)}")
    print()

    described = 0
    errors = 0

    for i, sp in enumerate(to_do):
        name = sp.get("common_name_es") or sp.get("common_name_en") or sp["scientific_name"]
        print(f"[{i+1}/{len(to_do)}] {name} ({sp['scientific_name']})", end="", flush=True)

        result = generate_description(sp, api_key)

        if result:
            sp["description_es"] = result.get("description_es")
            sp["description_en"] = result.get("description_en")
            sp["size_cm"] = result.get("size_cm")
            sp["depth_range_m"] = result.get("depth_range_m")
            sp["habitat"] = result.get("habitat")
            described += 1
            print(f" ✓")
        else:
            errors += 1
            print(f" ✗")

        # Rate limit: ~1 req/sec
        time.sleep(1.2)

        # Save periodically
        if (i + 1) % 20 == 0:
            with open(DATASET_PATH, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"  (saved progress: {described} done, {errors} errors)")

    # Final save
    with open(DATASET_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n=== Done ===")
    print(f"Described: {described}")
    print(f"Errors: {errors}")
    print(f"Total with descriptions: {already_done + described}/{len(recommended)}")


if __name__ == "__main__":
    main()
