'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import {
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  Globe,
  LogIn,
  User,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme, mounted } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const cookies = document.cookie;
    if (cookies.includes('access_token')) {
      const storedUser = localStorage.getItem('jonoshor_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserRole(parsed.accountType || 'user');
        } catch {
          setUserRole('user');
        }
      } else {
        setUserRole('user');
      }
    } else {
      setUserRole(null);
    }
    setMobileMenuOpen(false);
  }, [pathname]);

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
            <Link
              href={
                userRole === 'superAdmin'
                  ? '/super-admin/dashboard'
                  : userRole === 'admin'
                  ? '/admin/dashboard'
                  : '/user/dashboard'
              }
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-blue text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5 text-brand-blue" />
              <span>
                {userRole === 'superAdmin'
                  ? t.navSuperAdmin
                  : userRole === 'admin'
                  ? t.navAdmin
                  : t.navDashboard}
              </span>
            </Link>
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-brand-blue dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5">
            <Link
              href="/complaints/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-5 rounded-full bg-brand-blue text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
            >
              <span>{t.navSubmitComplaint}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={
                userRole === 'superAdmin'
                  ? '/super-admin/dashboard'
                  : userRole === 'admin'
                  ? '/admin/dashboard'
                  : userRole === 'user'
                  ? '/user/dashboard'
                  : '/login'
              }
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold text-center"
            >
              {userRole ? (lang === 'bn' ? 'ড্যাশবোর্ড খুলুন' : 'Open Dashboard') : t.navLogin}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
