import { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Map from './components/map/Map';
import SidePanel from './components/sidePanel/SidePanel';
import Timeline from './components/timeline/Timeline';

function App() {
  const [year, setYear] = useState(1444);

  return (
    <>
      <div className='appMain'>
        <Navbar />
        <div className='bodyMain'>
          <div className='mapAndPanel'>
            <Map year={year} />

            <SidePanel
              year={year}
              name="Archduchy of Austria"
              nameLocal="Erzherzogtum Österreich"
              capital="Vienna"
              govt="Feudal Monarchy"
              leader="Friedrich III von Habsburg"
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