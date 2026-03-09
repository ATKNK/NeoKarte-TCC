import { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Map from './components/map/Map';
import SidePanel from './components/sidePanel/SidePanel';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='appMain'>
        <Navbar />
        <div className='bodyMain'>
          <Map />
          <SidePanel year="1444" name="Archduchy of Austria" nameLocal="Erzherzogtum Österreich" capital="Vienna" govt="Feudal Monarchy" leader="Friedrich III von Habsburg"/>
        </div>
      </div>
    </>
  )
}

export default App
