'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, supabase, signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
  { name: 'How it Works', href: '#how-it-works' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(({ user, error }) => {
      if (!error) {
        setUser(user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // Listen for custom event to open login modal
    const openLoginModal = () => setShowAuthModal(true);
    window.addEventListener('open-login-modal', openLoginModal);
    return () => {
      listener?.subscription.unsubscribe();
      window.removeEventListener('open-login-modal', openLoginModal);
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPassword('');
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      setUser(null);
      router.push('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-morphism shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and Beta */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
              <Rocket className="w-8 h-8 text-secondary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold gradient-text">LaunchBox.AI</span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold glass-beta-badge border border-blue-400/40 backdrop-blur-md hidden sm:inline-block">BETA</span>
          </motion.div>

          {/* Hamburger for mobile */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="sm:hidden p-2 text-foreground hover:text-secondary transition-colors focus-visible:focus"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>

          {/* Navigation and User Controls */}
          <div className="hidden sm:flex items-center space-x-8 flex-1 justify-end">
            <nav className="flex items-center space-x-8">
              {navigation.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  onClick={() => scrollToSection(item.href)}
                  className="relative text-foreground hover:text-secondary transition-colors duration-300 focus-visible:focus group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full" />
                </motion.button>
              ))}
              {/* Dashboard link for logged-in users */}
              {user && (
                <motion.a
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + navigation.length * 0.1 }}
                  href="/dashboard"
                  className="relative text-foreground hover:text-secondary transition-colors duration-300 focus-visible:focus group font-semibold"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full" />
                </motion.a>
              )}
            </nav>
            {/* User Controls */}
            <div className="flex items-center space-x-2 ml-4">
              {user ? (
                <span className="text-slate-300 text-sm truncate max-w-[140px] md:max-w-[200px] lg:max-w-[300px] overflow-hidden">{user.email}</span>
              ) : null}
              {user ? (
                <Button size="sm" variant="outline" onClick={handleLogout}>Logout</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowAuthModal(true)}>Login / Signup</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-morphism border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left text-foreground hover:text-secondary transition-colors py-2 focus-visible:focus"
                >
                  {item.name}
                </button>
              ))}
              {/* Dashboard link for logged-in users (mobile) */}
              {user && (
                <a
                  href="/dashboard"
                  className="block w-full text-left text-foreground hover:text-secondary transition-colors py-2 font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
              )}
              {/* Mobile User Controls */}
              <div className="pt-2 border-t border-white/10 mt-2">
                {user ? (
                  <>
                    <span className="block text-slate-300 text-sm truncate mb-2">{user.email}</span>
                    <Button size="sm" variant="outline" className="w-full" onClick={handleLogout}>Logout</Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => { setShowAuthModal(true); setIsMobileMenuOpen(false); }}>Login / Signup</Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth UI */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleAuth} className="bg-slate-900 p-6 rounded-lg shadow-lg w-80 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
              required
            />
            {authError && <div className="text-red-400 text-sm">{authError}</div>}
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
            </Button>
            <div className="flex justify-between text-xs text-slate-400">
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="underline">
                {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
              </button>
              <button type="button" onClick={() => setShowAuthModal(false)} className="underline">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </motion.header>
  );
}