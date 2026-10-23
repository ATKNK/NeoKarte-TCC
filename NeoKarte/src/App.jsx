
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import './App.css';

import Navbar from './components/navbar/Navbar';
import MainMap from './pages/mainMap/mainMap';
import CountryManager from './pages/countryManager/countryManager';
import CountryViewer from './pages/countryViewer/countryViewer';

function App() {
  return (
    <BrowserRouter>
      <div className="appMain">
        <Navbar />

        <div className="bodyMain">
          <Routes>
            <Route path="/" element={<MainMap />} />

            <Route
              path="/country-manager"
              element={<CountryManager />}
            />

            <Route
              path="/countries/:tag"
              element={<CountryViewer/>}
            />

            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
