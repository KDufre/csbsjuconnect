import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600 mt-1">Your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#C41E3A] to-[#A01828] p-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-[#C41E3A]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{user.name}</h3>
              <p className="text-red-100">CSBSJU Student</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Account Information</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#7EC8E3]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#7EC8E3]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">About CSBSJU Connect</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                CSBSJU Connect is a student-only rideshare coordination platform designed
                specifically for the College of Saint Benedict and Saint John's University
                community.
              </p>
              <p>
                This prototype demonstrates the feasibility of connecting students for safe,
                convenient ridesharing within our campus community.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Safety Guidelines</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#C41E3A] font-bold">•</span>
                <span>Only share rides with verified CSBSJU students</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E3A] font-bold">•</span>
                <span>Meet in well-lit, public areas on campus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E3A] font-bold">•</span>
                <span>Share your trip details with a friend or family member</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E3A] font-bold">•</span>
                <span>Follow all traffic laws and campus safety guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C41E3A] font-bold">•</span>
                <span>Trust your instincts and report any concerns to campus security</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleSignOut}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This is a this MERN version uses JWT authentication. In production,
              CSBSJU Connect could be upgraded to use the official CSBSJU Single Sign-On (SSO) system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
