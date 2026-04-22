import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const allowedDomains = ['csbsju.edu', 'csb.edu'];

const isAllowedEmail = (email: string) => {
  const at = email.lastIndexOf('@');
  if (at === -1) return false;
  return allowedDomains.includes(email.slice(at + 1).toLowerCase());
};

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedEmail = email.trim().toLowerCase();
    const cleanedName = name.trim();

    try {
      if (!isAllowedEmail(cleanedEmail)) {
        throw new Error('Please use your @csbsju.edu or @csb.edu email.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      if (isRegister) await signUp(cleanedName, cleanedEmail, password);
      else await signIn(cleanedEmail, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/MainLogo.png" alt="CSBSJU Connect Logo" className="w-28 h-28 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSBSJU Connect</h1>
          <p className="text-[#7EC8E3] font-medium">Student Rideshare Coordination</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-[#7EC8E3]/40 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-[#C41E3A] to-[#7EC8E3]" />
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@csbsju.edu" required autoFocus className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7EC8E3] focus:border-transparent outline-none transition" />
              </div>

              {isRegister && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" required={isRegister} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7EC8E3] focus:border-transparent outline-none transition" />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7EC8E3] focus:border-transparent outline-none transition" />
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-[#C41E3A] text-white py-3 rounded-lg font-medium hover:bg-[#A01828] transition disabled:opacity-50">
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="w-full mt-4 text-sm text-[#C41E3A] font-medium hover:underline">
              {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
