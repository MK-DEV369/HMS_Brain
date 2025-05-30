import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Footer from './components/common/Footer';
import { UserProvider } from './context/UserContext';


function App() {
  return (
      <Router>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
          <main className="container mx-auto px-4">
            <UserProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/dashboard"
                  element={
                      <Dashboard />
                  }
                />
                <Route
                  path="/analysis"
                  element={
                      <Analysis />
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <SignedIn>
                      <Reports />
                    </SignedIn>
                  }
                />
                <Route
                  path="/login"
                  element={
                      <Login />
                  }
                />
                <Route
                  path="*"
                  element={
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  }
                />
              </Routes>
            </UserProvider>
          </main>
        </div>
        <Footer />
      </Router>
  );
}

export default App;