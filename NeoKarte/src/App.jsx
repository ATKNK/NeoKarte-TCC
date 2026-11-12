
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
import EventManager from './pages/eventManager/eventManager';
import Login from './pages/login/Login';
import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="appMain">
          <Navbar />

          <div className="bodyMain">
            <Routes>
              <Route path="/" element={<MainMap />} />
              <Route path="/login" element={<Login />} />

              <Route element={<RequireAuth />}>
                <Route path="/country-manager" element={<CountryManager />} />
                <Route path="/countries/:id" element={<CountryViewer />} />
                <Route path="/countries/:id/political_eras" element={<CountryViewer />} />
                <Route path="/people-manager" element={<PeopleManager />} />
                <Route path="/event-manager" element={<EventManager />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
