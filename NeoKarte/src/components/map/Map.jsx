import React from "react";
import "./Map.css";
import maps from "../../modules/maps/mapLoader";
import { getCountryByTag } from "../../modules/maps/getCountry";

function Map({ year, onCountrySelect }) {
    const key = `../../assets/maps/${year}.svg`;
    const MapComponent = maps[key];

    if (!MapComponent) {
        console.error("Mapa não encontrado:", key);
        return <div>Mapa não encontrado</div>;
    }

    function handleClick(e) {
        const tag = e.target.id;

        if (!tag) return;

        const country = getCountryByTag(tag);

        if (country && onCountrySelect) {
            onCountrySelect(country);
        }
    }

    return (
        <div className="mapMain" onClick={handleClick}>
            <MapComponent />
        </div>
    );
}

export default Map;