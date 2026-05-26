/* ============================================================================
 * storage.js  —  Persistencia local en el dispositivo
 * ----------------------------------------------------------------------------
 * Usa AsyncStorage: almacenamiento nativo, persistente, que NO sufre el
 * desalojo a 7 días de Safari (esa fue la razón de pasar de PWA a nativo).
 *
 * El snapshot completo se guarda como un único JSON. Para volúmenes grandes
 * o consultas sobre los datos en el dispositivo, el siguiente paso sería
 * expo-sqlite; para un snapshot de dashboards, AsyncStorage es suficiente.
 * ==========================================================================*/

import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE = "looker:snapshot";

// Guarda el snapshot recién traído de Looker.
export async function guardarSnapshot(snapshot) {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(snapshot));
}

// Lee el último snapshot guardado. Devuelve null si nunca se sincronizó.
export async function leerSnapshot() {
  const valor = await AsyncStorage.getItem(CLAVE);
  return valor ? JSON.parse(valor) : null;
}

// Borra los datos locales (p. ej. al cerrar sesión).
export async function borrarSnapshot() {
  await AsyncStorage.removeItem(CLAVE);
}
