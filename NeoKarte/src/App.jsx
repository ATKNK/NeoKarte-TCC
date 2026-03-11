import { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Map from './components/map/Map';
import SidePanel from './components/sidePanel/SidePanel';

function App() {
  const [year, setYear] = useState(1444);

  function changeYear(input) {
    console.log(`Definindo ${input}`);
    setYear(input);
  }

  return (
    <>
      <div className='appMain'>
        <Navbar />
        <div className='bodyMain'>
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
      </div>
    </>
  )
}

export default App;