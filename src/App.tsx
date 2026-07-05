import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { NerdHome } from './NerdHome';
import { MainSite } from './components/MainSite/MainSite';
import { DebugDashboard } from './components/Debug/DebugDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<NerdHome />} />
          <Route path="/resume" element={<MainSite />} />
          <Route path="/debug" element={<DebugDashboard />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
