import { createElement } from "react";

const REFERENCE_MAP_WIDTH = 903;
const REFERENCE_MAP_HEIGHT = 799;
const LONGITUDE_CENTER = 12;
const LONGITUDE_SCALE = 20;
const MERCATOR_CENTER = 1.2;
const MERCATOR_SCALE = 0.4;

// Cubic Mercator calibration fitted to the fourteen confirmed city reference points.
const X_CALIBRATION = [
    453.9823629499,
    243.512312178,
    -11.4625063261,
    5.6387151468,
    26.6668483001,
    -15.9885970092,
    -13.1341664592,
    2.1309594638,
    22.2280023758,
    0.3002539327,
];
const Y_CALIBRATION = [
    418.0573068485,
    -15.7623803375,
    -254.0754401048,
    0.9416529412,
    -16.4931196688,
    12.3716713741,
    12.9355860124,
    1.2827804153,
    -11.5240365166,
    3.3382227212,
];

function transformLatitude(latitude) {
    const latitudeInRadians = (latitude * Math.PI) / 180;
    return Math.log(Math.tan(Math.PI / 4 + latitudeInRadians / 2));
}

export function calculateRelativeDistance(lat, lon) {
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude <= -90 ||
        latitude >= 90
    ) {
        return null;
    }

    const normalizedLongitude = (longitude - LONGITUDE_CENTER) / LONGITUDE_SCALE;
    const normalizedLatitude =
        (transformLatitude(latitude) - MERCATOR_CENTER) / MERCATOR_SCALE;
    const coordinates = [
        1,
        normalizedLongitude,
        normalizedLatitude,
        normalizedLongitude ** 2,
        normalizedLongitude * normalizedLatitude,
        normalizedLatitude ** 2,
        normalizedLongitude ** 3,
        normalizedLongitude ** 2 * normalizedLatitude,
        normalizedLongitude * normalizedLatitude ** 2,
        normalizedLatitude ** 3,
    ];
    const x =
        (coordinates.reduce(
            (total, value, index) => total + value * X_CALIBRATION[index],
            0
        ) /
            REFERENCE_MAP_WIDTH) *
        100;
    const y =
        (coordinates.reduce(
            (total, value, index) => total + value * Y_CALIBRATION[index],
            0
        ) /
            REFERENCE_MAP_HEIGHT) *
        100;

    if (x < 0 || x > 100 || y < 0 || y > 100) {
        return null;
    }

    return { x, y };
}

export function renderEvent(event) {
    if (!event) return null;

    const position = calculateRelativeDistance(
        event.latitude,
        event.longitude
    );

    if (!position) return null;

    const label = [event.name, event.location, event.start_date]
        .filter(Boolean)
        .join(" - ");

    return createElement("span", {
        key: event.id,
        className: "mapEvent",
        role: "img",
        "aria-label": label || "Evento histórico",
        title: label || "Evento histórico",
        style: {
            left: `${position.x}%`,
            top: `${position.y}%`,
        },
    });
}
