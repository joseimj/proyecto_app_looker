/* ============================================================================
 * lookerClient.js  —  Comunicación con el backend de Looker
 * ----------------------------------------------------------------------------
 * La app NUNCA habla directo con Looker: habla con el backend intermedio,
 * que es quien guarda las credenciales y aplica los permisos del vendedor.
 * ==========================================================================*/

import { BACKEND_URL } from "./config";

// Trae el snapshot completo (todas las consultas) desde el backend.
// Devuelve el objeto { generadoEn, origen, datos } que se guardará local.
export async function fetchSnapshot() {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 20000); // corta a los 20 s

  try {
    const resp = await fetch(`${BACKEND_URL}/api/snapshot`, {
      headers: {
        // El token del vendedor lo emitiría el backend tras autenticarlo.
        Authorization: "Bearer DEMO",
      },
      signal: ctrl.signal,
    });
    if (!resp.ok) {
      throw new Error(`El backend respondió ${resp.status}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Comprobación opcional de que el backend y Looker responden.
export async function checkHealth() {
  const resp = await fetch(`${BACKEND_URL}/api/health`);
  return resp.json();
}
