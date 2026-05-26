"""
============================================================================
app.py  —  Backend intermedio entre la app móvil y Looker
----------------------------------------------------------------------------
Responsabilidades:
  - Guardar las credenciales de Looker (NUNCA viajan al dispositivo).
  - Autenticar al vendedor (placeholder: aquí va tu SSO/IdP).
  - Ejecutar las consultas en Looker y devolver el snapshot en JSON.

Arranque rápido:
    cd backend
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp looker.ini.example looker.ini      # y edita con tus datos
    python app.py

Probar sin la app móvil:
    curl http://localhost:8080/api/health
    curl http://localhost:8080/api/snapshot
============================================================================
"""

import json
import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

import looker_sdk
from looker_sdk.sdk.api40 import models as mdls

from queries import QUERIES, SAVED_LOOKS

# Si tienes Looks guardados en Looker y llenaste SAVED_LOOKS, ponlo en True.
USE_SAVED_LOOKS = False

app = Flask(__name__)
CORS(app)  # permite que la app Expo (otro origen) llame a este backend

# init40 lee looker.ini (o variables de entorno LOOKERSDK_*).
sdk = looker_sdk.init40("looker.ini")


def autenticar(req):
    """
    Placeholder de autenticación. En producción: validar el token contra tu
    IdP y devolver el usuario, para luego aplicar permisos por vendedor.
    """
    token = req.headers.get("Authorization", "")
    # usuario = validar_contra_idp(token)
    # if not usuario: abort(401)
    return {"id": "demo", "token": token}


def correr_inline_query(q):
    """Ejecuta una consulta inline en Looker y devuelve la lista de filas."""
    resultado = sdk.run_inline_query(
        result_format="json",
        body=mdls.WriteQuery(
            model=q["model"],
            view=q["view"],
            fields=q.get("fields", []),
            sorts=q.get("sorts", []),
            limit=str(q.get("limit", 500)),
        ),
    )
    return json.loads(resultado)  # run_inline_query devuelve un string JSON


def correr_look(look_id):
    """Ejecuta un Look guardado en Looker y devuelve la lista de filas."""
    return json.loads(sdk.run_look(look_id=look_id, result_format="json"))


@app.route("/api/health")
def health():
    """Comprueba que el backend está vivo y que conecta con Looker."""
    try:
        yo = sdk.me()
        return jsonify(ok=True, looker_usuario=yo.display_name)
    except Exception as e:
        return jsonify(ok=False, error=str(e)), 502


@app.route("/api/snapshot")
def snapshot():
    """
    Ejecuta TODAS las consultas y devuelve un único snapshot.
    Este JSON es lo que la app móvil guardará en el dispositivo.
    """
    autenticar(request)  # en producción aplicaría permisos por usuario

    datos = {}
    for clave, q in QUERIES.items():
        try:
            if USE_SAVED_LOOKS and clave in SAVED_LOOKS:
                filas = correr_look(SAVED_LOOKS[clave])
            else:
                filas = correr_inline_query(q)
            datos[clave] = {"titulo": q["titulo"], "filas": filas}
        except Exception as e:
            # Una consulta que falle no debe tumbar todo el snapshot.
            datos[clave] = {"titulo": q["titulo"], "filas": [], "error": str(e)}

    return jsonify(
        generadoEn=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        origen="looker",
        datos=datos,
    )


if __name__ == "__main__":
    # host=0.0.0.0 para que el teléfono pueda alcanzarlo en la red local.
    # En producción: detrás de HTTPS y de tu IdP.
    app.run(host="0.0.0.0", port=8080, debug=True)
