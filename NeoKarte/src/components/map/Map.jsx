import React from "react";
import "./Map.css";
import maps from "../../modules/maps/mapLoader";
import { getPoliticalEra } from "../../modules/maps/getCountry";
import heightMap from "../../assets/img/GeographyHeight.png"; 

function Map({ year, onCountrySelect }) {
    const key = `../../assets/maps/${year}.svg`;
    const MapComponent = maps[key];

    async function handleClick(e) {
        const tag = e.target.closest?.("[id]")?.id;

        if (!tag) return;

        const politicalEras = await getPoliticalEra(tag, `${year}-11-11`);
        const politicalEra = politicalEras?.[0];

        if (politicalEra && onCountrySelect) {
            onCountrySelect({
                ...politicalEra,
                tag,
                flag: politicalEra.flag?.image || `/flags/${tag}.png`
            });
        }
    }

    if (!MapComponent) {
        console.error("Mapa não encontrado:", key);
        return <div>Mapa não encontrado</div>;
    }

    return (
        <div className="mapMain" onClick={handleClick}>
            <MapComponent />
            <img className="mapHeight" src={heightMap} alt="HeightMap" />
        </div>
    );
}

export default Map;