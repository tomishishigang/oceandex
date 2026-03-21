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

  // V3: Gamification / Badges
  'badges.title': { es: 'Logros', en: 'Badges' },
  'badges.earned': { es: '¡Nuevo logro desbloqueado!', en: 'New badge unlocked!' },
  'badges.progress': { es: 'Progreso', en: 'Progress' },
  'badges.locked': { es: 'Bloqueado', en: 'Locked' },
  'badges.earned_label': { es: 'Obtenido', en: 'Earned' },
  'badges.count': { es: 'logros', en: 'badges' },
  // Badge names
  'badge.primera-inmersion': { es: 'Primera inmersión', en: 'First dive' },
  'badge.primera-inmersion.desc': { es: 'Registra tu primera inmersión', en: 'Log your first dive' },
  'badge.cinco-inmersiones': { es: 'Buzo dedicado', en: 'Dedicated diver' },
  'badge.cinco-inmersiones.desc': { es: 'Registra 5 inmersiones', en: 'Log 5 dives' },
  'badge.diez-inmersiones': { es: 'Buzo veterano', en: 'Veteran diver' },
  'badge.diez-inmersiones.desc': { es: 'Registra 10 inmersiones', en: 'Log 10 dives' },
  'badge.diez-especies': { es: 'Primeros descubrimientos', en: 'First discoveries' },
  'badge.diez-especies.desc': { es: 'Avista 10 especies únicas', en: 'Spot 10 unique species' },
  'badge.veinticinco-especies': { es: 'Observador nato', en: 'Natural observer' },
  'badge.veinticinco-especies.desc': { es: 'Avista 25 especies únicas', en: 'Spot 25 unique species' },
  'badge.cincuenta-especies': { es: 'Medio centenar', en: 'Half century' },
  'badge.cincuenta-especies.desc': { es: 'Avista 50 especies únicas', en: 'Spot 50 unique species' },
  'badge.cien-especies': { es: 'Centenario', en: 'Century club' },
  'badge.cien-especies.desc': { es: 'Avista 100 especies únicas', en: 'Spot 100 unique species' },
  'badge.oceandex-completo': { es: 'Oceandex completo', en: 'Oceandex complete' },
  'badge.oceandex-completo.desc': { es: 'Avista las 327 especies recomendadas', en: 'Spot all 327 recommended species' },
  'badge.encuentro-tiburon': { es: 'Encuentro con tiburones', en: 'Shark encounter' },
  'badge.encuentro-tiburon.desc': { es: 'Avista un tiburón o raya', en: 'Spot a shark or ray' },
  'badge.cazador-nudibranquios': { es: 'Cazador de nudibranquios', en: 'Nudibranch hunter' },
  'badge.cazador-nudibranquios.desc': { es: 'Avista 3 especies de nudibranquios', en: 'Spot 3 nudibranch species' },
  'badge.rey-invertebrados': { es: 'Rey de invertebrados', en: 'Invertebrate king' },
  'badge.rey-invertebrados.desc': { es: 'Avista 10 especies de crustáceos', en: 'Spot 10 crustacean species' },
  'badge.estrellero': { es: 'Estrellero', en: 'Star collector' },
  'badge.estrellero.desc': { es: 'Avista 5 especies de equinodermos', en: 'Spot 5 echinoderm species' },
  'badge.explorador-novato': { es: 'Explorador novato', en: 'Novice explorer' },
  'badge.explorador-novato.desc': { es: 'Bucea en 3 sitios diferentes', en: 'Dive at 3 different sites' },
  'badge.gran-explorador': { es: 'Gran explorador', en: 'Great explorer' },
  'badge.gran-explorador.desc': { es: 'Bucea en 10 sitios diferentes', en: 'Dive at 10 different sites' },
  'badge.explorador-quintay': { es: 'Rey de Quintay', en: 'King of Quintay' },
  'badge.explorador-quintay.desc': { es: 'Bucea en todos los sitios de Quintay', en: 'Dive at all Quintay sites' },

  // V3: Interactive map
  'sites.map_view': { es: 'Mapa', en: 'Map' },
  'sites.list_view': { es: 'Lista', en: 'List' },
  'map.depth': { es: 'Profundidad', en: 'Depth' },
  'map.difficulty': { es: 'Dificultad', en: 'Difficulty' },
  'map.sightings': { es: 'avistamientos', en: 'sightings' },
  'map.view_detail': { es: 'Ver detalle', en: 'View detail' },

  // V3: Photo upload
  'photo.add': { es: 'Agregar foto', en: 'Add photo' },
  'photo.remove': { es: 'Eliminar foto', en: 'Remove photo' },
  'photo.count': { es: 'fotos', en: 'photos' },
  'photo.compressing': { es: 'Comprimiendo...', en: 'Compressing...' },
  'photo.view': { es: 'Ver foto', en: 'View photo' },
  'photo.close': { es: 'Cerrar', en: 'Close' },
  'photo.your_photos': { es: 'Tus fotos', en: 'Your photos' },

  // Language toggle
  'lang.switch': { es: 'EN', en: 'ES' },
}

export default strings
