import countries from '../../data/pt/base.json';

const countryIndex = Object.values(countries).reduce((acc, region) => {
    Object.entries(region).forEach(([tag, country]) => {
        acc[tag] = country;
    });
    return acc;
}, {});

export function getCountryByTag(tag) {
    return countryIndex[tag] || null;
}

export function getCountriesByRegion(region) {
    return Object.values(countries[region] || {});
}