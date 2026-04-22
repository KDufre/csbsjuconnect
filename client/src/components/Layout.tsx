import { ReactNode } from 'react';
import { Home, Search, Plus, Calendar, User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'home' | 'find' | 'offer' | 'rides' | 'profile';
  onNavigate: (page: 'home' | 'find' | 'offer' | 'rides' | 'profile') => void;
}

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'find' as const, label: 'Find Ride', icon: Search },
    { id: 'offer' as const, label: 'Offer Ride', icon: Plus },
    { id: 'rides' as const, label: 'My Rides', icon: Calendar },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <img
            src="/MainLogo.png"
            alt="CSBSJU Connect"
            className="w-10 h-10"
          />
          <h1 className="text-xl font-bold text-gray-900 ml-3">CSBSJU Connect</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center py-3 px-4 transition ${
                    isActive
                      ? 'text-[#C41E3A]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
