import L from "leaflet";
import "leaflet/dist/leaflet.css";

const d = document;

// Inicializa el mapa y establece la vista en el centro de México.
document.addEventListener("DOMContentLoaded", async () => {
  const estados = await loadEstados();

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
      click: async (e) => {
        const data = await loadEstado(feature.properties.id);
        buildDataEstado(data, feature.properties.name);
      },
    });
  }

  let geojson;
  // Cargar GeoJSON de los estados de México
  fetch("/data/estadosSetupLeaflet.json")
    .then((response) => response.json())
    .then((data) => {
      geojson = L.geoJson(data, {
        style,
        onEachFeature,
      }).addTo(map);
    });
});

const loadEstados = async () => {
  const response = await fetch("/data/estados.json");
  const data = await response.json();
  return data;
};

const loadEstado = async (id) => {
  const response = await fetch(`/data/${id}/main.json`);
  const data = await response.json();
  return data;
};

const buildDataEstado = (data, estadoNombre) => {
  d.querySelector(".no-content").style.display = "none";
  const { items } = data;
  const totalItemsText = `${items.length} ${
    items.length === 1 ? "items" : "items"
  }`;
  let result = "";

  result += `
    <div class="title">
      <h2>${estadoNombre}</h2>
      <span class="badge badge-primary">${totalItemsText}</span>
    </div>
  `;

  result += `
    <div class="scrollable">
      <ul class="items">`;
  items.forEach((item) => {
    const { title, link } = item;
    result += `<li>
      <p>${title}</p>
      <a class="btn-more">Ver contenido</a>
    </li>`;
  });
  result += `</ul>
    </div>`;
  d.querySelector(".content").innerHTML = result;
};

const openModal = (item) => {};
