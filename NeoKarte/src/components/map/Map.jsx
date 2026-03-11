import React from "react";
import "./Map.css";
import maps from "../../modules/maps/mapLoader";

function Map({ year }) {
    const key = `../../assets/maps/${year}.svg`;
    const MapComponent = maps[key];

    if (!MapComponent) {
        console.error("Mapa não encontrado:", key);
        return <div>Mapa não encontrado</div>;
    }

    return (
        <div className="mapMain">
            <MapComponent />
        </div>
    );
}

export default Map;