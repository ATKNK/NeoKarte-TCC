import { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Map from './components/map/Map';
import SidePanel from './components/sidePanel/SidePanel';
import Timeline from './components/timeline/Timeline';

function App() {
  const [year, setYear] = useState(1444);
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <>
      <div className='appMain'>
        <Navbar />
        <div className='bodyMain'>
          <div className='mapAndPanel'>
            <Map year={year} onCountrySelect={setSelectedCountry}/>

            <SidePanel
              year={year}
              {...selectedCountry}
            />
          </div>
          <div className='timeline'>
            <Timeline onYearChange={setYear}/>
          </div>
        </div>
      </div>
    </>
  )
}

export default App;