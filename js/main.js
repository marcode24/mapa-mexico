const d = document;
let estadoItems = [];

const colorEstado = "#FFEDA0";
const colorEstadoBorder = "#FFFFFF";
const colorEstadoHover = "#666";
const colorEstadoBorderHover = "#666";
const colorEstadoSeleccionado = "#FF5733";
const colorEstadoSeleccionadoBorder = "#333333";
const zoomInicial = 5;
const zoomMax = 8;
const zoomMin = 5;
let selectedLayer = null; // Variable para almacenar el estado seleccionado

document.addEventListener("DOMContentLoaded", async () => {
  const map = L.map("map").setView([23.6345, -102.5528], zoomInicial);

  // Establece los límites de visualización en el área de México
  const southWest = L.latLng(14.559, -118.144);
  const northEast = L.latLng(32.718, -86.588);
  const bounds = L.latLngBounds(southWest, northEast);

  // Establece los límites para el zoom y el desplazamiento
  map.setMaxBounds(bounds);
  map.setMinZoom(zoomMin);
  map.setMaxZoom(zoomMax);

  map.on("drag", () => {
    map.panInsideBounds(bounds, { animate: false });
  });

  // Funciones de estilo y eventos
  function style() {
    return {
      fillColor: colorEstado,
      weight: 2,
      opacity: 1,
      color: colorEstadoBorder,
      dashArray: "1",
      fillOpacity: 0.7,
    };
  }

  function highlightFeature(e) {
    if (selectedLayer === e.target) return;

    const layer = e.target;

    layer.setStyle({
      weight: 2,
      color: colorEstadoBorderHover,
      fillColor: colorEstadoHover,
      dashArray: "",
    });

    selectedLayer?.setStyle({
      color: colorEstadoSeleccionadoBorder,
      fillColor: colorEstadoSeleccionado,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
      selectedLayer?.bringToFront();
    }
  }

  function resetHighlight(e) {
    if (selectedLayer !== e.target) {
      geojson.resetStyle(e.target);
    }
  }

  async function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: async (e) => {
        if (selectedLayer && selectedLayer !== e.target) {
          selectedLayer.setStyle({
            fillColor: colorEstado,
            color: colorEstadoBorder,
          });
        }

        // Actualiza la referencia al estado seleccionado
        selectedLayer = e.target;

        // Cambia el color del estado seleccionado
        selectedLayer.setStyle({
          fillColor: colorEstadoSeleccionado,
          color: colorEstadoSeleccionadoBorder,
          weight: 3,
        });

        const data = await loadEstado(feature.properties.id);
        estadoItems = data.items;
        buildDataEstado(data, feature.properties.name);
      },
    });
  }

  const data = await loadSetup();
  let geojson = L.geoJSON(data, {
    style,
    onEachFeature,
  }).addTo(map);
});

const loadSetup = async () => {
  const response = await fetch("/data/estadosSetupLeaflet.json");
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
    items.length === 1 ? "item" : "items"
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
    const { title, link, id } = item;
    result += `
    <li class="btn-more" data-id="${id}">
      <p>${title}</p>
    </li>`;
  });
  result += `</ul>
    </div>`;
  d.querySelector(".content").innerHTML = result;
  d.querySelectorAll(".btn-more").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      openModal(id);
    });
  });
};

const openModal = (id) => {
  d.querySelector(".modal")?.remove();
  const item = estadoItems.find((item) => item.id === id);
  if (!item) return;
  const { title, image, description } = item;
  const result = `
   <div class="modal dialog">
      <div class="modal-content">
        <div class="header">
          <span class="title">${title}</span>
          <div class="i-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style="fill: rgba(0, 0, 0, 1)"
            >
              <path
                d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"
              ></path>
            </svg>
          </div>
        </div>
        <div class="body">
          <div class="estado-content">
            <img
              src="${image}"
              alt="${title}"
              loading="lazy"
            />
            <p class="description">${description}</p>
          </div>
        </div>
      </div>
    </div>`;

  d.body.insertAdjacentHTML("beforeend", result);

  d.querySelector(".modal").classList.add("modal-open");
  d.querySelector(".i-wrapper").addEventListener("click", (e) => closeModal());
};

const closeModal = () => {
  d.querySelector(".modal").classList.remove("modal-open");
};
