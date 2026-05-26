# Ventas en Campo — App nativa (iOS + Android) con Looker offline

Proyecto **end-to-end** que permite a la fuerza de ventas consultar dashboards
de Looker **sin conexión**: sincroniza los datos mientras hay cobertura, los
guarda en el dispositivo y los muestra aunque no haya red.

Es **un punto de partida** funcional, no un producto terminado (ver
"Pendientes para producción" más abajo).

## Por qué esta arquitectura

```
   ┌─────────────┐   HTTPS    ┌──────────────┐   API Looker   ┌──────────┐
   │  App móvil   │ ─────────▶ │   Backend     │ ─────────────▶ │  Looker   │
   │ (Expo / RN)  │            │ (Flask + SDK) │                │           │
   └─────────────┘            └──────────────┘                └──────────┘
        │
        └─▶ Guarda el snapshot en almacenamiento NATIVO del dispositivo
            (se consulta sin red; no sufre el desalojo a 7 días de Safari)
```

- **Una sola base de código** corre en iOS y Android (React Native vía Expo).
- **El backend** guarda las credenciales de Looker — nunca viajan al teléfono —
  y aplica los permisos de cada vendedor.
- **El almacenamiento es nativo**, por eso se eligió app nativa sobre PWA.

## Estructura

```
backend/                 Backend intermedio (Python)
  app.py                 servidor Flask + endpoints
  queries.py             >>> AQUÍ defines tus consultas de Looker
  requirements.txt
  looker.ini.example     plantilla de credenciales

mobile/                  App móvil (Expo / React Native)
  App.js                 pantalla principal y orquestación
  app.json               configuración de Expo
  src/
    config.js            >>> AQUÍ pones la URL del backend
    lookerClient.js      llamadas al backend
    storage.js           persistencia local en el dispositivo
    connectivity.js      detección online/offline
    components/Dashboard.js   renderizado de los datos
```

---

## Cómo probarlo, paso a paso

### Parte 1 — Backend (conecta con tu Looker)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp looker.ini.example looker.ini   # luego edítalo con los datos de TU instancia
```

Edita `queries.py`: los nombres de `model`, `view` y `fields` deben coincidir
con tu modelo LookML real (ábrelo en un Explore de Looker para verlos).

Levanta el backend:

```bash
python app.py
```

Verifica que conecta con Looker:

```bash
curl http://localhost:8080/api/health
# Esperado: {"ok": true, "looker_usuario": "..."}

curl http://localhost:8080/api/snapshot
# Esperado: el JSON con los datos de tus consultas
```

Si `/api/health` falla, el problema es de credenciales o de `base_url` en
`looker.ini` — resuélvelo antes de seguir.

### Parte 2 — App móvil (Expo)

Necesitas Node.js instalado. Genera el proyecto Expo con el CLI (esto fija
versiones compatibles automáticamente) y añade las dependencias:

```bash
cd mobile
npx create-expo-app@latest . --template blank
npx expo install @react-native-async-storage/async-storage @react-native-community/netinfo
```

Cuando el CLI pregunte si sobrescribir, conserva el `App.js`, la carpeta `src/`
y el `app.json` de ESTE proyecto (son el código que vas a probar). La carpeta
`src/` y el `App.js` provistos aquí van encima del proyecto generado.

Apunta la app a tu backend: edita `src/config.js` y pon la **IP local de tu
computadora** (no `localhost`), por ejemplo `http://192.168.1.50:8080`.
El teléfono y la computadora deben estar en la misma red Wi-Fi.

Arranca:

```bash
npx expo start
```

Se abre un código QR. Instala la app **Expo Go** en tu teléfono
(App Store / Play Store) y escanea el QR. La app se abre en tu teléfono real.

### Parte 3 — Probar el modo offline (lo importante)

1. Con conexión, pulsa **Sincronizar ahora**: la app trae los datos de Looker
   y los guarda en el teléfono.
2. Activa el **modo avión** en el teléfono.
3. Cierra la app por completo y vuelve a abrirla.
4. Resultado esperado: la app abre y **muestra los datos guardados**, con el
   indicador "Sin conexión" y el banner de antigüedad ("datos de hace 2 h").

Eso es exactamente la persistencia offline que pide tu área comercial.

---

## Pendientes para producción

Este proyecto demuestra el flujo completo. Antes de campo faltaría:

- **Autenticación real** de los vendedores (SSO / IdP corporativo); hoy el
  backend tiene un placeholder en la función `autenticar()`.
- **Permisos por vendedor** (row-level security): que cada quien vea solo sus
  datos. El punto de aplicación ya está marcado en `app.py`.
- **Cifrado de los datos** guardados en el dispositivo.
- **Caducidad y borrado** del snapshot al cerrar sesión.
- **HTTPS** en el backend y despliegue en infraestructura real.
- Si el volumen de datos crece, mover el almacenamiento de AsyncStorage a
  **expo-sqlite** (permite consultar los datos en el dispositivo).
- Compilar binarios para las tiendas con **EAS Build** (`eas build`), ya sin
  depender de Expo Go.

## Resumen de qué editas tú

| Archivo | Qué pones |
|---|---|
| `backend/looker.ini` | credenciales y URL de tu instancia de Looker |
| `backend/queries.py` | tus consultas (model / view / fields de tu LookML) |
| `mobile/src/config.js` | la URL del backend |

