class MarkerManager {
    constructor(map, markersLayer) {
        this.map = map;
        this.markersLayer = markersLayer;
        this.markers = new Map();
        this.baseUrl = 'http://localhost:3000'; // URL вашего сервера
    }

    async addMarker(lat, lon, title, description) {
        try {
            const response = await fetch(`${this.baseUrl}/api/markers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shirota: lat,
                    dolgota: lon,
                    title: title,
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save marker');
            }

            const markerData = await response.json();
            
            const marker = L.marker([lat, lon]).addTo(this.markersLayer);
            marker.bindPopup(`<b>${title || "Без названия"}</b><br><p style="white-space: pre-line;">${description || ""}</p>`);
            
            this.markers.set(markerData.id, {
                marker: marker,
                data: markerData
            });

            marker.on("click", () => {
                if (window.currentMode === "delete") {
                    if (confirm("Удалить эту метку?")) {
                        this.deleteMarker(markerData.id);
                    }
                }
            });

            return markerData.id;
        } catch (error) {
            console.error("Error adding marker:", error);
            throw error;
        }
    }

    async deleteMarker(markerId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/markers/${markerId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete marker');
            }

            const markerInfo = this.markers.get(markerId);
            if (markerInfo && this.markersLayer.hasLayer(markerInfo.marker)) {
                this.markersLayer.removeLayer(markerInfo.marker);
            }

            this.markers.delete(markerId);
            return true;
        } catch (error) {
            console.error("Error deleting marker:", error);
            throw error;
        }
    }

    async loadMarkers() {
        try {
            this.markersLayer.clearLayers();
            this.markers.clear();

            const response = await fetch(`${this.baseUrl}/api/markers`);
            if (!response.ok) {
                throw new Error('Failed to load markers');
            }

            const markersData = await response.json();

            markersData.forEach(markerData => {
                const marker = L.marker([markerData.shirota, markerData.dolgota]).addTo(this.markersLayer);
                marker.bindPopup(`<b>${markerData.title || "Без названия"}</b><br>${markerData.description || ""}`);

                this.markers.set(markerData.id, {
                    marker: marker,
                    data: markerData
                });

                marker.on("click", () => {
                    if (window.currentMode === "delete") {
                        if (confirm("Удалить эту метку?")) {
                            this.deleteMarker(markerData.id);
                        }
                    }
                });
            });

            return markersData.length;
        } catch (error) {
            console.error("Error loading markers:", error);
            throw error;
        }
    }
}