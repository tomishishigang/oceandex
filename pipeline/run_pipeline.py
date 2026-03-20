#!/usr/bin/env python3
"""
Oceandex Data Pipeline - Run all steps sequentially.

Steps:
  1. fetch_obis     - Get species checklist from OBIS for central Chile dive zones
  2. enrich_worms   - Add taxonomy + common names from WoRMS
  3. enrich_images  - Add photos from iNaturalist
  4. build_dataset  - Merge into final Oceandex dataset

Usage:
  python run_pipeline.py              # Run all steps
  python run_pipeline.py --step 1     # Run only step 1
  python run_pipeline.py --from 2     # Run from step 2 onwards
"""

import argparse
import importlib
import sys
import time


STEPS = [
    ("fetch_obis", "Fetch species from OBIS"),
    ("enrich_worms", "Enrich with WoRMS taxonomy & common names"),
    ("enrich_images", "Fetch images from iNaturalist"),
    ("build_dataset", "Build final Oceandex dataset"),
]


def run_step(module_name: str, description: str, step_num: int):
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {description}")
    print(f"{'='*60}\n")

    start = time.time()
    module = importlib.import_module(module_name)
    module.main()
    elapsed = time.time() - start

    print(f"\n✓ Step {step_num} completed in {elapsed:.1f}s")


def main():
    parser = argparse.ArgumentParser(description="Oceandex Data Pipeline")
    parser.add_argument("--step", type=int, help="Run only this step (1-4)")
    parser.add_argument("--from", dest="from_step", type=int, default=1,
                        help="Start from this step (1-4)")
    args = parser.parse_args()

    print("🌊 Oceandex Data Pipeline")
    print(f"   Region: Central Chile (Valparaíso / Coquimbo)")
    print(f"   Sources: OBIS → WoRMS → iNaturalist")
    print()

    if args.step:
        idx = args.step - 1
        if 0 <= idx < len(STEPS):
            run_step(STEPS[idx][0], STEPS[idx][1], args.step)
        else:
            print(f"Error: step must be 1-{len(STEPS)}")
            sys.exit(1)
    else:
        for i, (module, desc) in enumerate(STEPS):
            if i + 1 >= args.from_step:
                run_step(module, desc, i + 1)

    print(f"\n{'='*60}")
    print("🐙 Pipeline complete! Check data/ for output files.")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
