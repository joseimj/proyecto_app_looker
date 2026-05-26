/* ============================================================================
 * App.js  —  Pantalla principal de la app
 * ----------------------------------------------------------------------------
 * Une las piezas:
 *   useConnectivity  -> ¿hay red?
 *   lookerClient     -> trae datos de Looker (vía backend) cuando hay red
 *   storage          -> los persiste en el dispositivo
 *   Dashboard        -> los pinta
 *
 * Lógica clave (offline-first): SIEMPRE se pinta lo que hay guardado en el
 * dispositivo. La red solo sirve para ACTUALIZAR ese guardado, nunca es
 * requisito para mostrar algo.
 * ==========================================================================*/

import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView, ScrollView, View, Text, TouchableOpacity,
  StyleSheet, StatusBar, RefreshControl,
} from "react-native";

import { theme } from "./src/theme";
import { useConnectivity } from "./src/connectivity";
import { fetchSnapshot } from "./src/lookerClient";
import { guardarSnapshot, leerSnapshot } from "./src/storage";
import Dashboard from "./src/components/Dashboard";

function fmtFecha(iso) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium", timeStyle: "short",
  }).format(new Date(iso));
}

function edadTexto(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  return `hace ${Math.round(min / 60)} h`;
}

export default function App() {
  const enLinea = useConnectivity();
  const [snapshot, setSnapshot] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [aviso, setAviso] = useState(null);

  // Al arrancar: pinta lo que haya en el dispositivo (con o sin red).
  useEffect(() => {
    leerSnapshot().then(setSnapshot).catch(() => {});
  }, []);

  const sincronizar = useCallback(async () => {
    if (!enLinea) {
      setAviso({ tipo: "info", texto: "Sin conexión. Se muestran los datos guardados." });
      return;
    }
    setSincronizando(true);
    setAviso(null);
    try {
      const fresco = await fetchSnapshot();      // 1. traer de Looker
      await guardarSnapshot(fresco);             // 2. guardar en el dispositivo
      setSnapshot(fresco);                       // 3. repintar
      setAviso({ tipo: "ok", texto: "Datos actualizados." });
    } catch (e) {
      setAviso({
        tipo: "error",
        texto: "No se pudo sincronizar. Se conservan los datos anteriores.",
      });
    } finally {
      setSincronizando(false);
    }
  }, [enLinea]);

  const datosViejos =
    snapshot &&
    Date.now() - new Date(snapshot.generadoEn).getTime() > 12 * 3600 * 1000;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.fondo} />

      {/* ----- Cabecera ----- */}
      <View style={s.cabecera}>
        <View style={s.cabeceraFila}>
          <View>
            <Text style={s.titulo}>Ventas en Campo</Text>
            <Text style={s.subtitulo}>Dashboard de fuerza de ventas</Text>
          </View>
          <View style={[s.pill,
            enLinea ? s.pillOnline : s.pillOffline]}>
            <Text style={[s.pillTexto,
              { color: enLinea ? theme.ok : theme.error }]}>
              {enLinea ? "En línea" : "Sin conexión"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[s.boton, (!enLinea || sincronizando) && s.botonOff]}
          onPress={sincronizar}
          disabled={!enLinea || sincronizando}
          activeOpacity={0.85}
        >
          <Text style={s.botonTexto}>
            {sincronizando ? "Sincronizando…" : "Sincronizar ahora"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={sincronizando}
            onRefresh={sincronizar}
            tintColor={theme.acento}
          />
        }
      >
        {/* ----- Banner de antigüedad de datos ----- */}
        {snapshot && (
          <View style={[s.banner,
            datosViejos ? s.bannerAlerta : s.bannerOk]}>
            <Text style={s.bannerTexto}>
              Datos al {fmtFecha(snapshot.generadoEn)}
            </Text>
            <Text style={s.bannerEdad}>{edadTexto(snapshot.generadoEn)}</Text>
          </View>
        )}

        {/* ----- Aviso ----- */}
        {aviso && (
          <View style={[s.aviso, s[`aviso_${aviso.tipo}`]]}>
            <Text style={s.avisoTexto}>{aviso.texto}</Text>
          </View>
        )}

        {/* ----- Contenido ----- */}
        {snapshot ? (
          <Dashboard datos={snapshot.datos} />
        ) : (
          <View style={s.vacio}>
            <Text style={s.vacioTitulo}>
              Aún no hay datos en el dispositivo
            </Text>
            <Text style={s.vacioSub}>
              Conéctate a una red y pulsa Sincronizar ahora para descargar la
              información. Después podrás consultarla sin cobertura.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.fondo },

  cabecera: {
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: theme.borde,
    backgroundColor: theme.superficie,
  },
  cabeceraFila: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titulo: { color: theme.texto, fontSize: 21, fontWeight: "700" },
  subtitulo: { color: theme.textoTenue, fontSize: 13, marginTop: 2 },

  pill: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    borderWidth: 1,
  },
  pillOnline: {
    backgroundColor: "rgba(52,211,153,0.14)",
    borderColor: "rgba(52,211,153,0.4)",
  },
  pillOffline: {
    backgroundColor: "rgba(248,113,113,0.14)",
    borderColor: "rgba(248,113,113,0.4)",
  },
  pillTexto: { fontSize: 12, fontWeight: "600" },

  boton: {
    marginTop: 14, backgroundColor: theme.acento,
    borderRadius: 14, paddingVertical: 13, alignItems: "center",
  },
  botonOff: { opacity: 0.4 },
  botonTexto: { color: "#04121f", fontSize: 15, fontWeight: "700" },

  scroll: { padding: 18, gap: 14 },

  banner: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 11, borderRadius: 14, borderWidth: 1,
  },
  bannerOk: {
    backgroundColor: "rgba(59,157,255,0.12)",
    borderColor: "rgba(59,157,255,0.35)",
  },
  bannerAlerta: {
    backgroundColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.4)",
  },
  bannerTexto: { color: theme.texto, fontSize: 13 },
  bannerEdad: { color: theme.textoTenue, fontSize: 12 },

  aviso: { padding: 11, borderRadius: 14 },
  aviso_ok: { backgroundColor: "rgba(52,211,153,0.14)" },
  aviso_info: { backgroundColor: "rgba(59,157,255,0.14)" },
  aviso_error: { backgroundColor: "rgba(248,113,113,0.14)" },
  avisoTexto: { color: theme.texto, fontSize: 13 },

  vacio: { paddingVertical: 56, paddingHorizontal: 16, alignItems: "center" },
  vacioTitulo: { color: theme.texto, fontSize: 15, fontWeight: "600" },
  vacioSub: {
    color: theme.textoTenue, fontSize: 13, textAlign: "center",
    marginTop: 8, lineHeight: 19,
  },
});
