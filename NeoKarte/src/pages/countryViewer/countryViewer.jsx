import { getCountryByTag } from '../../modules/maps/getCountry';
import './countryViewer.css';

function CountryViewer(countryTag){

    const country = getCountryByTag(countryTag);

    return(
        <div className='countryViewerMain'>
            <p className='countryViewerTitle'>{country.name} - {country.tag}</p>

            <div className='countryViewerPanel'>

            </div>
        </div>
    )
}

export default CountryViewer;