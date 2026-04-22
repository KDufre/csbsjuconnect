import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Home from './components/Home';
import FindRide from './components/FindRide';
import OfferRide from './components/OfferRide';
import MyRides from './components/MyRides';
import Profile from './components/Profile';

export type Page = 'home' | 'find' | 'offer' | 'rides' | 'profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) return <Login />;

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home />;
      case 'find': return <FindRide />;
      case 'offer': return <OfferRide />;
      case 'rides': return <MyRides />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
