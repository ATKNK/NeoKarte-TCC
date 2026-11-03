
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
import PeopleManager from './pages/peopleManager/peopleManager';

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
              path="/countries/:id"
              element={<CountryViewer />}
            />

            <Route
              path="/countries/:id/political_eras"
              element={<CountryViewer />}
            />

            <Route
              path='/people-manager'
              element={<PeopleManager />} />

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
