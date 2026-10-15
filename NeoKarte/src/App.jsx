import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/Navbar';
import MainMap from './pages/mainMap/mainMap';
import CountryManager from './pages/countryManager/countryManager';

function App() {
  return (
    <BrowserRouter>
      <div className='appMain'>
        <Navbar/>
        <div className='bodyMain'>
          <Routes>
            <Route path='/' element={<MainMap />} />
            <Route path='*' element={<Navigate to='/' replace />} />
            <Route path='/country-manager' element={<CountryManager/>}/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App;