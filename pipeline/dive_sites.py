"""
Dive sites in central Chile used to define geographic boundaries for species queries.
Data compiled from Zentacle, Wannadive, PADI, and local dive operator information.
"""

DIVE_SITES = [
    # === QUINTAY AREA (Valparaíso) ===
    {
        "name": "La Caldera",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1916,
        "lng": -71.7021,
        "max_depth_m": 10,
        "difficulty": "beginner",
        "type": ["wreck", "reef"],
        "source": "zentacle",
    },
    {
        "name": "Los Jardines",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1883,
        "lng": -71.7004,
        "max_depth_m": 22,
        "difficulty": "intermediate",
        "type": ["wreck", "reef"],
        "source": "zentacle",
    },
    {
        "name": "El Fraile",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1789,
        "lng": -71.7296,
        "max_depth_m": 50,
        "difficulty": "advanced",
        "type": ["deep", "cave", "reef"],
        "source": "wannadive",
    },
    {
        "name": "Bajo Playa Chica",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.2120,
        "lng": -71.7040,
        "max_depth_m": 28,
        "difficulty": "intermediate",
        "type": ["wreck", "reef"],
        "source": "wannadive",
    },
    {
        "name": "El Falucho",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1910,
        "lng": -71.7020,
        "max_depth_m": 16,
        "difficulty": "beginner",
        "type": ["wreck"],
        "source": "wannadive",
    },
    {
        "name": "La Isla",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1910,
        "lng": -71.7040,
        "max_depth_m": 32,
        "difficulty": "intermediate",
        "type": ["deep"],
        "source": "wannadive",
    },
    {
        "name": "Lobera de Curaumilla",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.1000,
        "lng": -71.7440,
        "max_depth_m": 20,
        "difficulty": "beginner",
        "type": ["reef"],
        "source": "zentacle",
    },
    {
        "name": "Remolcador Caupolicán",
        "zone": "Quintay",
        "region": "Valparaíso",
        "lat": -33.0250,
        "lng": -71.6290,
        "max_depth_m": 24,
        "difficulty": "beginner",
        "type": ["wreck"],
        "source": "zentacle",
    },
    # === ZAPALLAR / PAPUDO AREA ===
    {
        "name": "Bajo el Cerro de la Cruz",
        "zone": "Zapallar",
        "region": "Valparaíso",
        "lat": -32.5520,
        "lng": -71.4740,
        "max_depth_m": 30,
        "difficulty": "intermediate",
        "type": ["wall", "reef"],
        "source": "zentacle",
    },
    {
        "name": "La Catedral",
        "zone": "Zapallar",
        "region": "Valparaíso",
        "lat": -32.4758,
        "lng": -71.4388,
        "max_depth_m": 20,
        "difficulty": "intermediate",
        "type": ["cave", "wall"],
        "source": "zentacle",
    },
    {
        "name": "La Isla Seca",
        "zone": "Zapallar",
        "region": "Valparaíso",
        "lat": -32.5880,
        "lng": -71.4560,
        "max_depth_m": 20,
        "difficulty": "intermediate",
        "type": ["reef", "wall"],
        "source": "zentacle",
    },
    # === LOS MOLLES ===
    {
        "name": "Los Molles",
        "zone": "Los Molles",
        "region": "Valparaíso",
        "lat": -32.2382,
        "lng": -71.5110,
        "max_depth_m": 15,
        "difficulty": "beginner",
        "type": ["reef"],
        "source": "zentacle",
    },
    # === PICHIDANGUI ===
    {
        "name": "Pichidangui",
        "zone": "Pichidangui",
        "region": "Coquimbo",
        "lat": -32.1300,
        "lng": -71.5300,
        "max_depth_m": 30,
        "difficulty": "beginner",
        "type": ["reef"],
        "source": "local_info",
    },
    # === ALGARROBO ===
    {
        "name": "Algarrobo",
        "zone": "Algarrobo",
        "region": "Valparaíso",
        "lat": -33.3630,
        "lng": -71.6720,
        "max_depth_m": 20,
        "difficulty": "beginner",
        "type": ["reef"],
        "source": "padi",
    },
    # === CACHAGUA ===
    {
        "name": "Cachagua",
        "zone": "Cachagua",
        "region": "Valparaíso",
        "lat": -32.5750,
        "lng": -71.4530,
        "max_depth_m": 20,
        "difficulty": "beginner",
        "type": ["reef"],
        "source": "padi",
    },
]


def get_bounding_box(buffer_deg: float = 0.1):
    """Compute a bounding box that covers all dive sites with a buffer."""
    lats = [s["lat"] for s in DIVE_SITES]
    lngs = [s["lng"] for s in DIVE_SITES]
    return {
        "min_lat": min(lats) - buffer_deg,
        "max_lat": max(lats) + buffer_deg,
        "min_lng": min(lngs) - buffer_deg,
        "max_lng": max(lngs) + buffer_deg,
    }


def get_wkt_polygon(buffer_deg: float = 0.1) -> str:
    """Return a WKT POLYGON string covering all dive sites."""
    bb = get_bounding_box(buffer_deg)
    coords = (
        f"{bb['min_lng']} {bb['min_lat']},"
        f"{bb['min_lng']} {bb['max_lat']},"
        f"{bb['max_lng']} {bb['max_lat']},"
        f"{bb['max_lng']} {bb['min_lat']},"
        f"{bb['min_lng']} {bb['min_lat']}"
    )
    return f"POLYGON (({coords}))"


def get_max_dive_depth() -> int:
    """Return the maximum depth across all dive sites."""
    return max(s["max_depth_m"] for s in DIVE_SITES)


if __name__ == "__main__":
    bb = get_bounding_box()
    print(f"Bounding box: {bb}")
    print(f"WKT: {get_wkt_polygon()}")
    print(f"Max dive depth: {get_max_dive_depth()}m")
    print(f"Total sites: {len(DIVE_SITES)}")
    for site in DIVE_SITES:
        print(f"  - {site['name']} ({site['zone']}) | {site['max_depth_m']}m | {site['lat']}, {site['lng']}")
