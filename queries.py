"""
============================================================================
queries.py  —  Definición de las consultas que necesita la fuerza de ventas
----------------------------------------------------------------------------
>>> ESTO ES LO QUE DEBES AJUSTAR A TU INSTANCIA <<<

Cada entrada se traduce a un run_inline_query de Looker. Los nombres de
'model', 'view' y 'fields' DEBEN coincidir con tu modelo LookML real.
Para encontrarlos: abre un Explore en Looker, arma la consulta que quieres,
y en el menú de engrane elige "Get LookML" o revisa la URL del Explore.

Alternativa más simple de gobernar: en lugar de inline queries, usa Looks ya
guardados en Looker (ver USE_SAVED_LOOKS en app.py).
============================================================================
"""

QUERIES = {
    "kpis_vendedor": {
        "titulo": "Indicadores del vendedor",
        "model":  "ventas",          # <-- nombre de TU modelo LookML
        "view":   "desempenio",      # <-- nombre de TU Explore/view
        "fields": [
            "ventas.total_mes",
            "ventas.tickets",
            "ventas.ticket_promedio",
            "ventas.avance_cuota",
        ],
        "limit": 1,
    },
    "cuota_por_region": {
        "titulo": "Cuota vs. alcanzado por región",
        "model":  "ventas",
        "view":   "desempenio",
        "fields": [
            "region.nombre",
            "metas.cuota_mensual",
            "ventas.total_mes",
        ],
        "sorts": ["ventas.total_mes desc"],
        "limit": 50,
    },
    "top_productos": {
        "titulo": "Top productos del mes",
        "model":  "ventas",
        "view":   "desempenio",
        "fields": [
            "producto.nombre",
            "ventas.unidades",
            "ventas.total_mes",
        ],
        "sorts": ["ventas.unidades desc"],
        "limit": 5,
    },
}

# Si prefieres usar Looks guardados en Looker en vez de inline queries,
# pon aquí el ID de cada Look. app.py los usará si USE_SAVED_LOOKS = True.
SAVED_LOOKS = {
    # "kpis_vendedor":    123,
    # "cuota_por_region": 124,
    # "top_productos":    125,
}
