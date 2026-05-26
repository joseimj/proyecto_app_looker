/* ============================================================================
 * connectivity.js  —  Detección de estado de red
 * ----------------------------------------------------------------------------
 * Hook que informa, en tiempo real, si el dispositivo tiene conexión.
 * Es lo que permite a la app decidir: ¿sincronizo con Looker o leo local?
 * ==========================================================================*/

import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useConnectivity() {
  const [enLinea, setEnLinea] = useState(true);

  useEffect(() => {
    // Estado inicial.
    NetInfo.fetch().then((estado) => {
      setEnLinea(Boolean(estado.isConnected));
    });
    // Cambios en vivo (entrar/salir de cobertura).
    const cancelar = NetInfo.addEventListener((estado) => {
      setEnLinea(Boolean(estado.isConnected));
    });
    return () => cancelar();
  }, []);

  return enLinea;
}
