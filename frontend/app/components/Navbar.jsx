'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import {
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Globe,
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);

  const syncAuthState = () => {
    // 1. Immediate recognition if inside portal paths
    if (pathname?.startsWith('/user')) {
      setUserRole((prev) => prev || 'user');
    } else if (pathname?.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      setUserRole((prev) => prev || 'admin');
    } else if (pathname?.startsWith('/super-admin') && !pathname.startsWith('/super-admin/login')) {
      setUserRole((prev) => prev || 'superAdmin');
    }

    // 2. Read stored user from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('jonoshor_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed) {
            setUserRole(parsed.accountType || 'user');
            if (parsed.fullName || parsed.name) {
              setUserName(parsed.fullName || parsed.name);
            }
          }
        }
      } catch {}
    }

    // 3. Verify with authoritative backend session
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        const u = data.data?.user || data.user;
        if (u) {
          const role =
            u.accountType === 'superadmin' || u.accountType === 'superAdmin'
              ? 'superAdmin'
              : u.accountType === 'admin'
              ? 'admin'
              : 'user';
          setUserRole(role);
          if (u.fullName) setUserName(u.fullName);
          if (typeof window !== 'undefined') {
            localStorage.setItem('jonoshor_user', JSON.stringify({ ...u, accountType: role }));
          }
        }
      })
      .catch(() => {
        // Only clear state if outside authenticated portal routes
        if (!pathname?.startsWith('/user') && !pathname?.startsWith('/admin') && !pathname?.startsWith('/super-admin')) {
          setUserRole(null);
          setUserName(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('jonoshor_user');
          }
        }
      });
  };

  useEffect(() => {
    syncAuthState();
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const csrfRes = await fetch('/api/v1/csrf-token');
      const csrfData = await csrfRes.json();
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfData.csrfToken || '' },
        credentials: 'include',
      });
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jonoshor_user');
    }
    setUserRole(null);
    setUserName(null);
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: t.navHome },
    { href: '/reports', label: t.navReports },
    { href: '/statistics', label: t.navStats },
    { href: '/how-it-works', label: lang === 'bn' ? 'যাচাই প্রক্রিয়া' : 'Methodology' },
    { href: '/join-us', label: t.navJoinUs },
    { href: '/contact', label: lang === 'bn' ? 'যোগাযোগ' : 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 shadow-[0_2px_18px_-6px_rgba(20,86,209,0.08)] transition-colors">
      <div className="container mx-auto max-w-7xl px-4 h-[74px] flex items-center justify-between gap-4">
        {/* Brand Logo (Dreamhub crisp blue badge + clean wordmark) */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand-blue text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:bg-brand-blueDark transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="leading-none">
            <span className="font-bold text-xl text-brand-navy dark:text-white tracking-tight block">
              {t.siteTitle}
            </span>
            <span className="text-[10px] font-semibold text-brand-blue dark:text-blue-400 tracking-wider uppercase">
              JonoShor Care & Rights
            </span>
          </div>
        </Link>

        {/* Centered Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                  isActive
                    ? 'text-brand-blue dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-blue-400'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle, Language Switcher, Account, Royal Blue Pill CTA */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            data-testid="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-amber-400 flex items-center justify-center transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Bilingual Toggle */}
          <button
            type="button"
            onClick={() => toggleLanguage()}
            data-testid="lang-toggle"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-brand-blue dark:text-blue-400" />
            <span>{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
          </button>

          {/* Portal / Login */}
          {userRole ? (
            <div className="flex items-center gap-1.5">
              <Link
                href={
                  userRole === 'superAdmin'
                    ? '/super-admin/dashboard'
                    : userRole === 'admin'
                    ? '/admin/dashboard'
                    : '/user/dashboard'
                }
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-brand-blue dark:text-blue-300 text-xs font-bold transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">
                  {userName
                    ? userName.split(' ')[0]
                    : userRole === 'superAdmin'
                    ? t.navSuperAdmin
                    : userRole === 'admin'
                    ? t.navAdmin
                    : t.navDashboard}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors"
                title={lang === 'bn' ? 'লগআউট' : 'Sign Out'}
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-brand-blue text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-blue dark:text-blue-400" />
              <span>{t.navLogin}</span>
            </Link>
          )}

          {/* Primary Royal Blue Pill Button (Dreamhub Signature "Get Started ->" style) */}
          <Link
            href="/complaints/new"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <span>{t.navSubmitComplaint}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-amber-400"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => toggleLanguage()}
            className="px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Page Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-canvas-dark flex flex-col h-[100dvh] w-full overflow-hidden animate-in fade-in duration-200">
          {/* Top Bar inside Full Drawer */}
          <div className="h-[74px] px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-blue text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <span className="font-bold text-lg text-brand-navy dark:text-white tracking-tight block">
                  {t.siteTitle}
                </span>
                <span className="text-[9px] font-semibold text-brand-blue dark:text-blue-400 tracking-wider uppercase">
                  JonoShor Care & Rights
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-amber-400"
              >
                {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage()}
                className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900"
              >
                {lang === 'bn' ? 'EN' : 'বাং'}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close Navigation Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Links Scrollable Body */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/70 text-brand-blue dark:text-blue-400 font-bold shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isActive ? 'text-brand-blue dark:text-blue-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'}`} />
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions Fixed Section (Submit Complaint & Sign In / Dashboard) */}
          <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 backdrop-blur space-y-2.5 pb-8 sm:pb-5">
            <Link
              href="/complaints/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blueDark text-white text-sm font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all"
            >
              <span>{t.navSubmitComplaint}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {userRole ? (
              <div className="flex flex-col gap-2">
                <Link
                  href={
                    userRole === 'superAdmin'
                      ? '/super-admin/dashboard'
                      : userRole === 'admin'
                      ? '/admin/dashboard'
                      : '/user/dashboard'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-brand-blue dark:text-blue-300 text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>
                    {userName
                      ? `${userName} (${lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'})`
                      : lang === 'bn'
                      ? 'ড্যাশবোর্ড খুলুন'
                      : 'Open Dashboard'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 px-5 rounded-full border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.navLogout}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-brand-blue dark:text-blue-400" />
                <span>{t.navLogin}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
