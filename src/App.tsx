import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Signin from './components/auth/SignIn';
import Signup from './components/auth/SignUp';
import Footer from './components/common/Footer';
import { UserProvider } from './context/UserContext';

const ConfidentialNotice = () => (
  <div className="flex justify-center items-center h-[60vh] text-center">
    <div className="bg-white shadow-lg p-10 rounded-2xl max-w-md mx-auto border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">🔒 Confidential Access</h2>
      <p className="text-gray-600 mb-4">
        You must <span className="font-semibold text-blue-600">log in</span> to view this page.
        It contains sensitive medical information and is restricted to authorized users.
      </p>
      <a
        href="/signin"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Go to Sign In
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        <main className="container mx-auto px-4">
          <UserProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Public Routes */}
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <>
                    <SignedIn>
                      <Dashboard />
                    </SignedIn>
                    <SignedOut>
                      <ConfidentialNotice />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/analysis"
                element={
                  <>
                    <SignedIn>
                      <Analysis />
                    </SignedIn>
                    <SignedOut>
                      <ConfidentialNotice />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/reports"
                element={
                  <>
                    <SignedIn>
                      <Reports />
                    </SignedIn>
                    <SignedOut>
                      <ConfidentialNotice />
                    </SignedOut>
                  </>
                }
              />

              {/* Redirect all others */}
              <Route
                path="/"
                element={
                  <>
                    <SignedOut>
                      <ConfidentialNotice />
                    </SignedOut>
                    <SignedIn>
                      <div className="text-center py-20">
                        <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
                        <p className="mt-4 text-gray-500">The page you are looking for does not exist.</p>
                      </div>
                    </SignedIn>
                  </>
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


// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
// import Navbar from './components/common/Navbar';
// import Dashboard from './pages/Dashboard';
// import Home from './pages/Home';
// import Analysis from './pages/Analysis';
// import Reports from './pages/Reports';
// import Footer from './components/common/Footer';
// import { UserProvider } from './context/UserContext';

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
//         <main className="container mx-auto px-4">
//           <UserProvider>
//             <Routes>
//               <Route path="/" element={<Home />} />
//               <Route
//                 path="/dashboard"
//                 element={
//                   <SignedIn>
//                     <Dashboard />
//                   </SignedIn>
//                 }
//               />
//               <Route
//                 path="/analysis"
//                 element={
//                   <SignedIn>
//                     <Analysis />
//                   </SignedIn>
//                 }
//               />
//               <Route
//                 path="/reports"
//                 element={
//                   <SignedIn>
//                     <Reports />
//                   </SignedIn>
//                 }
//               />
//               {/* Fallback for unauthenticated users trying to access any route */}
//               <Route
//                 path="/"
//                 element={
//                   <SignedOut>
//                     <RedirectToSignIn />
//                   </SignedOut>
//                 }
//               />
//             </Routes>
//           </UserProvider>
//         </main>
//       </div>
//       <Footer />
//     </Router>
//   );
// }

// export default App;
