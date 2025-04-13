import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
//import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import LiveMonitor from './components/dashboard/LiveMonitor';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Footer from './components/common/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/monitor" element={<LiveMonitor />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

//<Route path="/dashboard" element={<Dashboard />} />