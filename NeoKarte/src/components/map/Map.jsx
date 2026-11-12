import React from "react";
import "./Map.css";
import maps from "../../modules/maps/mapLoader";
import { getAllEvents } from "../../modules/maps/getEvent";
import { getPoliticalEra } from "../../modules/maps/getCountry";
import { renderEvent } from "../../modules/maps/renderEvent";

function Map({ year, onCountrySelect }) {
    const [events, setEvents] = React.useState([]);
    const key = `../../assets/maps/${year}.svg`;
    const MapComponent = maps[key];

    React.useEffect(() => {
        let isMounted = true;

        getAllEvents()
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new TypeError("A resposta de eventos deve ser uma lista.");
                }

                if (isMounted) {
                    setEvents(data);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    console.error("Erro ao renderizar eventos históricos no mapa:", error);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleClick(e) {
        const tag = e.target.closest?.(".country[id]")?.id;

        if (!tag) return;

        const politicalEras = await getPoliticalEra(tag, `${year}-11-11`);
        const politicalEra = politicalEras?.[0];

        if (politicalEra && onCountrySelect) {
            onCountrySelect({
                ...politicalEra,
                tag
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
            <div className="mapEvents" aria-label="Eventos históricos">
                {events.map(renderEvent)}
            </div>
        </div>
    );
}

export default Map;