/* ============================================================================
 * Dashboard.js  —  Renderizado de los datos del snapshot
 * ----------------------------------------------------------------------------
 * Recibe el objeto `datos` del snapshot y lo dibuja. No sabe de red ni de
 * almacenamiento: solo pinta. Las gráficas se hacen con View/flex, sin
 * librerías externas (menos dependencias = menos cosas que se rompen).
 * ==========================================================================*/

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../theme";

const fmtMoneda = (n) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtNum = (n) => new Intl.NumberFormat("es-MX").format(n || 0);

/* ----- Indicadores del vendedor -------------------------------------------*/
function KPIs({ bloque }) {
  const k = (bloque && bloque.filas && bloque.filas[0]) || {};
  const tarjetas = [
    ["Ventas del mes", fmtMoneda(k["ventas.total_mes"])],
    ["Tickets", fmtNum(k["ventas.tickets"])],
    ["Ticket promedio", fmtMoneda(k["ventas.ticket_promedio"])],
    ["Avance de cuota",
      Math.round((k["ventas.avance_cuota"] || 0) * 100) + "%"],
  ];
  return (
    <View style={s.kpisGrid}>
      {tarjetas.map(([titulo, valor]) => (
        <View key={titulo} style={s.kpi}>
          <Text style={s.kpiValor}>{valor}</Text>
          <Text style={s.kpiTitulo}>{titulo}</Text>
        </View>
      ))}
    </View>
  );
}

/* ----- Cuota vs. alcanzado por región -------------------------------------*/
function Regiones({ bloque }) {
  const filas = (bloque && bloque.filas) || [];
  const max = Math.max(1, ...filas.map((f) => f["metas.cuota_mensual"] || 0));
  return (
    <View style={s.tarjeta}>
      <Text style={s.tarjetaTitulo}>{bloque.titulo}</Text>
      {filas.map((f, i) => {
        const cuota = f["metas.cuota_mensual"] || 0;
        const real = f["ventas.total_mes"] || 0;
        const cumple = real >= cuota;
        const color = cumple ? theme.ok : theme.alerta;
        return (
          <View key={i} style={s.barraBloque}>
            <View style={s.barraEtq}>
              <Text style={s.barraNombre}>{f["region.nombre"]}</Text>
              <Text style={[s.barraPct, { color }]}>
                {Math.round((real / (cuota || 1)) * 100)}%
              </Text>
            </View>
            <View style={s.barraPista}>
              {/* marca de cuota */}
              <View style={[s.barraCuota,
                { width: `${(cuota / max) * 100}%` }]} />
              {/* avance real */}
              <View style={[s.barraReal,
                { width: `${(real / max) * 100}%`, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ----- Top productos ------------------------------------------------------*/
function Productos({ bloque }) {
  const filas = (bloque && bloque.filas) || [];
  return (
    <View style={s.tarjeta}>
      <Text style={s.tarjetaTitulo}>{bloque.titulo}</Text>
      <View style={[s.fila, s.filaEncabezado]}>
        <Text style={[s.celda, s.celdaCab, { flex: 2 }]}>Producto</Text>
        <Text style={[s.celda, s.celdaCab, s.celdaNum]}>Unid.</Text>
        <Text style={[s.celda, s.celdaCab, s.celdaNum]}>Importe</Text>
      </View>
      {filas.map((f, i) => (
        <View key={i} style={s.fila}>
          <Text style={[s.celda, { flex: 2 }]} numberOfLines={1}>
            {f["producto.nombre"]}
          </Text>
          <Text style={[s.celda, s.celdaNum]}>
            {fmtNum(f["ventas.unidades"])}
          </Text>
          <Text style={[s.celda, s.celdaNum]}>
            {fmtMoneda(f["ventas.total_mes"])}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function Dashboard({ datos }) {
  return (
    <View style={{ gap: 16 }}>
      {datos.kpis_vendedor && <KPIs bloque={datos.kpis_vendedor} />}
      {datos.cuota_por_region && <Regiones bloque={datos.cuota_por_region} />}
      {datos.top_productos && <Productos bloque={datos.top_productos} />}
    </View>
  );
}

const s = StyleSheet.create({
  kpisGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  kpi: {
    flexGrow: 1, flexBasis: "45%",
    backgroundColor: theme.superficie,
    borderColor: theme.borde, borderWidth: 1, borderRadius: 14,
    padding: 14,
  },
  kpiValor: { color: theme.texto, fontSize: 20, fontWeight: "600" },
  kpiTitulo: { color: theme.textoTenue, fontSize: 12, marginTop: 4 },

  tarjeta: {
    backgroundColor: theme.superficie,
    borderColor: theme.borde, borderWidth: 1, borderRadius: 14,
    padding: 16,
  },
  tarjetaTitulo: {
    color: theme.texto, fontSize: 15, fontWeight: "600", marginBottom: 14,
  },

  barraBloque: { marginBottom: 14 },
  barraEtq: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 6,
  },
  barraNombre: { color: theme.texto, fontSize: 13 },
  barraPct: { fontSize: 13, fontWeight: "600" },
  barraPista: {
    height: 22, backgroundColor: theme.superficie2,
    borderRadius: 6, overflow: "hidden",
  },
  barraCuota: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    borderRightWidth: 1, borderRightColor: theme.textoTenue,
    borderStyle: "dashed",
  },
  barraReal: {
    position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 6,
  },

  fila: {
    flexDirection: "row", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: theme.borde,
  },
  filaEncabezado: { paddingVertical: 6 },
  celda: { color: theme.texto, fontSize: 13, flex: 1 },
  celdaCab: {
    color: theme.textoTenue, fontSize: 11, fontWeight: "600",
    textTransform: "uppercase",
  },
  celdaNum: { textAlign: "right" },
});
