import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Inicializa el mapa y establece la vista en el centro de México.
document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([23.6345, -102.5528], 5);

  // Establece los límites de visualización en el área de México
  const southWest = L.latLng(14.559, -118.144);
  const northEast = L.latLng(32.718, -86.588);
  const bounds = L.latLngBounds(southWest, northEast);

  // Establece los límites para el zoom y el desplazamiento
  map.setMaxBounds(bounds);
  map.setMinZoom(5);
  map.setMaxZoom(7);

  map.on("drag", () => {
    map.panInsideBounds(bounds, { animate: false });
  });

  // Funciones de estilo y eventos
  function style(feature) {
    return {
      fillColor: "#FFEDA0",
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "1",
      fillOpacity: 0.7,
    };
  }

  function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: "#E31A1C",
      dashArray: "",
      fillOpacity: 0.7,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: (e) => {
        alert("Estado: " + feature.properties.name);
      },
    });
  }

  let geojson;
  // Cargar GeoJSON de los estados de México
  fetch("/data/estados.json")
    .then((response) => response.json())
    .then((data) => {
      geojson = L.geoJson(data, {
        style,
        onEachFeature,
      }).addTo(map);
    });
});
