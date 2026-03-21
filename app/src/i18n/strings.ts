export type Locale = 'es' | 'en'

const strings: Record<string, Record<Locale, string>> = {
  // Header
  'app.title': { es: 'Oceandex', en: 'Oceandex' },
  'app.subtitle': { es: 'Chile Central', en: 'Central Chile' },

  // Navigation
  'nav.species': { es: 'Especies', en: 'Species' },
  'nav.sites': { es: 'Sitios', en: 'Sites' },

  // Species list
  'species.search': { es: 'Buscar especie...', en: 'Search species...' },
  'species.all': { es: 'Todas', en: 'All' },
  'species.recommended': { es: 'Recomendadas', en: 'Recommended' },
  'species.count': { es: 'especies', en: 'species' },
  'species.no_results': { es: 'No se encontraron especies', en: 'No species found' },
  'species.no_photo': { es: 'Sin foto', en: 'No photo' },

  // Filters
  'filter.category': { es: 'Categoría', en: 'Category' },
  'filter.tier': { es: 'Avistamiento', en: 'Sighting' },
  'filter.clear': { es: 'Limpiar', en: 'Clear' },

  // Sightability tiers
  'tier.common': { es: 'Común', en: 'Common' },
  'tier.uncommon': { es: 'Poco común', en: 'Uncommon' },
  'tier.rare': { es: 'Raro', en: 'Rare' },
  'tier.unlikely': { es: 'Improbable', en: 'Unlikely' },

  // Species detail
  'detail.taxonomy': { es: 'Taxonomía', en: 'Taxonomy' },
  'detail.sightability': { es: 'Probabilidad de avistamiento', en: 'Sighting probability' },
  'detail.wikipedia': { es: 'Ver en Wikipedia', en: 'View on Wikipedia' },
  'detail.back': { es: 'Volver', en: 'Back' },
  'detail.kingdom': { es: 'Reino', en: 'Kingdom' },
  'detail.phylum': { es: 'Filo', en: 'Phylum' },
  'detail.class': { es: 'Clase', en: 'Class' },
  'detail.order': { es: 'Orden', en: 'Order' },
  'detail.family': { es: 'Familia', en: 'Family' },
  'detail.genus': { es: 'Género', en: 'Genus' },
  'detail.category': { es: 'Categoría', en: 'Category' },
  'detail.observations': { es: 'Observaciones', en: 'Observations' },
  'detail.obis': { es: 'Registros OBIS', en: 'OBIS records' },
  'detail.inat': { es: 'Observaciones iNaturalist', en: 'iNaturalist observations' },
  'detail.photo_by': { es: 'Foto por', en: 'Photo by' },
  'detail.not_found': { es: 'Especie no encontrada', en: 'Species not found' },
  'detail.score': { es: 'Puntaje', en: 'Score' },

  // Dive sites
  'sites.title': { es: 'Sitios de buceo', en: 'Dive sites' },
  'sites.subtitle': { es: 'Zona central de Chile', en: 'Central Chile zone' },
  'sites.depth': { es: 'Prof. máx.', en: 'Max depth' },
  'sites.difficulty': { es: 'Dificultad', en: 'Difficulty' },
  'sites.type': { es: 'Tipo', en: 'Type' },
  'sites.sites_count': { es: 'sitios', en: 'sites' },
  'sites.map': { es: 'Ver en mapa', en: 'View on map' },
  'difficulty.beginner': { es: 'Principiante', en: 'Beginner' },
  'difficulty.intermediate': { es: 'Intermedio', en: 'Intermediate' },
  'difficulty.advanced': { es: 'Avanzado', en: 'Advanced' },
  'sitetype.wreck': { es: 'Naufragio', en: 'Wreck' },
  'sitetype.reef': { es: 'Arrecife', en: 'Reef' },
  'sitetype.deep': { es: 'Profundo', en: 'Deep' },
  'sitetype.cave': { es: 'Cueva', en: 'Cave' },
  'sitetype.wall': { es: 'Pared', en: 'Wall' },

  // Dive log
  'nav.log': { es: 'Bitácora', en: 'Dive Log' },
  'log.title': { es: 'Bitácora de buceo', en: 'Dive Log' },
  'log.empty': { es: 'Aún no tienes inmersiones registradas', en: 'No dives logged yet' },
  'log.empty_cta': { es: 'Registra tu primera inmersión', en: 'Log your first dive' },
  'log.new': { es: 'Nueva inmersión', en: 'New dive' },
  'log.total_dives': { es: 'inmersiones', en: 'dives' },
  'log.species_seen': { es: 'especies vistas', en: 'species seen' },
  'log.delete': { es: 'Eliminar inmersión', en: 'Delete dive' },
  'log.delete_confirm': { es: '¿Eliminar esta inmersión y todos sus avistamientos?', en: 'Delete this dive and all its sightings?' },
  'log.no_sightings': { es: 'Sin avistamientos registrados', en: 'No sightings recorded' },

  // New dive form
  'newdive.title': { es: 'Nueva inmersión', en: 'New dive' },
  'newdive.site': { es: 'Sitio de buceo', en: 'Dive site' },
  'newdive.site_placeholder': { es: 'Selecciona o escribe un sitio...', en: 'Select or type a site...' },
  'newdive.date': { es: 'Fecha', en: 'Date' },
  'newdive.depth': { es: 'Profundidad máx. (m)', en: 'Max depth (m)' },
  'newdive.notes': { es: 'Notas', en: 'Notes' },
  'newdive.notes_placeholder': { es: 'Condiciones, compañeros, etc.', en: 'Conditions, buddies, etc.' },
  'newdive.save': { es: 'Guardar', en: 'Save' },
  'newdive.cancel': { es: 'Cancelar', en: 'Cancel' },

  // Sightings
  'sighting.mark_seen': { es: 'Marcar como visto', en: 'Mark as seen' },
  'sighting.seen': { es: 'Visto', en: 'Seen' },
  'sighting.seen_in': { es: 'Visto en', en: 'Seen in' },
  'sighting.add_to_session': { es: 'Agregar a inmersión', en: 'Add to dive' },
  'sighting.select_session': { es: 'Selecciona una inmersión', en: 'Select a dive' },
  'sighting.added': { es: 'Avistamiento registrado', en: 'Sighting recorded' },
  'sighting.already': { es: 'Ya registrado en esta inmersión', en: 'Already recorded in this dive' },
  'sighting.history': { es: 'Historial de avistamientos', en: 'Sighting history' },
  'sighting.times_seen': { es: 'veces visto', en: 'times seen' },

  // Stats
  'stats.progress': { es: 'Progreso del Oceandex', en: 'Oceandex progress' },
  'stats.seen_of': { es: 'de', en: 'of' },

  // Export/Import
  'export.title': { es: 'Exportar datos', en: 'Export data' },
  'export.download': { es: 'Descargar respaldo', en: 'Download backup' },
  'export.import': { es: 'Importar respaldo', en: 'Import backup' },
  'export.success': { es: 'Datos importados correctamente', en: 'Data imported successfully' },
  'export.error': { es: 'Error al importar datos', en: 'Error importing data' },

  // V2: Dive conditions
  'conditions.title': { es: 'Condiciones', en: 'Conditions' },
  'conditions.temp': { es: 'Temp. agua (°C)', en: 'Water temp (°C)' },
  'conditions.visibility': { es: 'Visibilidad (m)', en: 'Visibility (m)' },
  'conditions.current': { es: 'Corriente', en: 'Current' },
  'current.none': { es: 'Sin corriente', en: 'None' },
  'current.light': { es: 'Suave', en: 'Light' },
  'current.moderate': { es: 'Moderada', en: 'Moderate' },
  'current.strong': { es: 'Fuerte', en: 'Strong' },

  // V2: Species picker
  'picker.title': { es: 'Agregar especies', en: 'Add species' },
  'picker.search': { es: 'Buscar especie...', en: 'Search species...' },
  'picker.selected': { es: 'seleccionadas', en: 'selected' },
  'picker.add': { es: 'Agregar', en: 'Add' },
  'picker.close': { es: 'Cerrar', en: 'Close' },
  'picker.add_species': { es: 'Agregar especies', en: 'Add species' },

  // V2: Species at site
  'site.detail_title': { es: 'Detalle del sitio', en: 'Site detail' },
  'site.your_sightings': { es: 'Tus avistamientos aquí', en: 'Your sightings here' },
  'site.no_sightings': { es: 'Aún no has registrado avistamientos en este sitio', en: 'No sightings logged at this site yet' },
  'site.dive_here': { es: 'Registrar inmersión aquí', en: 'Log a dive here' },
  'site.dives_count': { es: 'inmersiones aquí', en: 'dives here' },

  // V2: Species comparison
  'compare.title': { es: 'Comparar especies', en: 'Compare species' },
  'compare.select_first': { es: 'Selecciona la primera especie', en: 'Select first species' },
  'compare.select_second': { es: 'Selecciona la segunda especie', en: 'Select second species' },
  'compare.vs': { es: 'vs', en: 'vs' },
  'compare.differences': { es: 'Diferencias', en: 'Differences' },
  'compare.same': { es: 'Igual', en: 'Same' },
  'compare.change': { es: 'Cambiar', en: 'Change' },

  // Language toggle
  'lang.switch': { es: 'EN', en: 'ES' },
}

export default strings
