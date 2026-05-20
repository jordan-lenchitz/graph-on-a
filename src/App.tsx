import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { NerdHome } from './NerdHome';
import { MainSite } from './components/MainSite/MainSite';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/nerd" element={<NerdHome />} />
      </Routes>
    </Router>
  );
}

export default App;
