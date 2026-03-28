import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from './screens/MainMenu';
import { NewCareer } from './screens/NewCareer';
import { Dashboard } from './screens/Dashboard';
import { Squad } from './screens/Squad';
import { Fixtures } from './screens/Fixtures';
import { Tactics } from './screens/Tactics';
import { Settings } from './screens/Settings';
import { Career } from './screens/Career';
import { Training } from './screens/Training';
import { Clubhouse } from './screens/Clubhouse';
import { useGame } from './context/GameContext';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasSave } = useGame();
  if (!hasSave) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/new-career" element={<NewCareer />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Other routes */}
        <Route path="/squad" element={<ProtectedRoute><Squad /></ProtectedRoute>} />
        <Route path="/tactics" element={<ProtectedRoute><Tactics /></ProtectedRoute>} />
        <Route path="/fixtures" element={<ProtectedRoute><Fixtures /></ProtectedRoute>} />
        <Route path="/competitions" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute><Career /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
        <Route path="/clubhouse" element={<ProtectedRoute><Clubhouse /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
