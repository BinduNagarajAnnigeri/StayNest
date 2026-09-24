if (
  !listing.geometry ||
  !listing.geometry.coordinates ||
  listing.geometry.coordinates[0] === 0
) {
  document.getElementById("map").innerHTML =
    '<p class="text-muted ps-2">Map not available for this listing.</p>';
} else {
  const [lng, lat] = listing.geometry.coordinates;
  const map = L.map("map").setView([lat, lng], 10);

  // ── Tile layers (English vs Local language) ──
  const englishTiles = L.tileLayer(
    "https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=Za4vBSiDnbZ9JYGnaWaX",
    {
      attribution: "© MapTiler © OpenStreetMap contributors",
      maxZoom: 20,
    },
  );

  const localTiles = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "© OpenStreetMap contributors",
    },
  );

  let currentLang = "en";
  englishTiles.addTo(map);

  const homeIcon = L.divIcon({
    className: "",
    html: `<div class="map-marker">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FF0000"
               style="filter: drop-shadow(0 0 3px white) drop-shadow(0 0 3px white);">
               <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
             </svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const locationIcon = L.divIcon({
    className: "",
    html: `<div class="map-marker">
             <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                  width="40" height="40" 
                  style="filter: drop-shadow(0 0 3px white) drop-shadow(0 0 3px white) drop-shadow(0px 2px 4px rgba(0,0,0,0.4));" />
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // listing marker
  const marker = L.marker([lat, lng], { icon: homeIcon })
    .addTo(map)
    .bindPopup(`<b>${listing.title}</b><br>${listing.location}`)
    .openPopup();

  setTimeout(() => {
    const el = marker.getElement();
    if (el) {
      el.addEventListener("mouseenter", () => {
        marker.setIcon(locationIcon);
        marker.openPopup();
      });
      el.addEventListener("mouseleave", () => {
        marker.setIcon(homeIcon);
        marker.openPopup();
      });
      el.addEventListener("click", () => {
        marker.setIcon(locationIcon);
        marker.openPopup();
      });
    }
  }, 100);

  // ── Language toggle button ──
  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      if (currentLang === "en") {
        map.removeLayer(englishTiles);
        localTiles.addTo(map);
        currentLang = "local";
        langBtn.textContent = "🌐 English";
      } else {
        map.removeLayer(localTiles);
        englishTiles.addTo(map);
        currentLang = "en";
        langBtn.textContent = "🌐 Local Language";
      }
    });
  }
}
