import { useState } from 'react';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Map from './components/map/Map';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='appMain'>
        <Navbar />
        <div className='bodyMain'>
          <Map />
        </div>
      </div>
    </>
  )
}

export default App
