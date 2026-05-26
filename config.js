/* ============================================================================
 * config.js  —  Configuración de la app
 * ----------------------------------------------------------------------------
 * BACKEND_URL debe apuntar al backend (carpeta /backend de este proyecto).
 *
 * Para PROBAR en un teléfono real con el backend corriendo en tu computadora:
 *   - Ambos deben estar en la MISMA red Wi-Fi.
 *   - Usa la IP local de tu computadora, NO "localhost"
 *     (localhost en el teléfono se refiere al teléfono mismo).
 *   - Para encontrar tu IP local:
 *       macOS/Linux:  ifconfig | grep "inet "
 *       Windows:      ipconfig
 *   - Ejemplo:  http://192.168.1.50:8080
 *
 * En producción esto sería la URL pública del backend, siempre con HTTPS.
 * ==========================================================================*/

export const BACKEND_URL = "http://192.168.1.50:8080"; // <-- AJUSTA ESTA IP
