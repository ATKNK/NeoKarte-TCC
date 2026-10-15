import { useState } from 'react';
import Map from '../../components/map/Map';
import SidePanel from '../../components/sidePanel/SidePanel';
import Timeline from '../../components/timeline/Timeline';
import './mainMap.css';

function MainMap() {
    const [year, setYear] = useState(1444);
    const [selectedCountry, setSelectedCountry] = useState(null);

    function handleCountrySelect(country) {
        setSelectedCountry(country);
    }

    function handleYearChange(newYear) {
        setYear(newYear);
    }

    return (
        <div className='mainMapMain'>
            <div className='mainMapMap'>
                <Map year={year} onCountrySelect={handleCountrySelect} />
                <SidePanel year={year} {...selectedCountry} />
            </div>
            <div className='mainMapTimeline'>
                <Timeline onYearChange={handleYearChange}/>
            </div>
        </div>
    )
}

export default MainMap;