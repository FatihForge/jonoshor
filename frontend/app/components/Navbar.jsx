'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import {
  ShieldAlert,
  FileText,
  PlusCircle,
  BarChart3,
  Users,
  Menu,
  X,
  Globe,
  LogIn,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'user', 'admin', 'superAdmin'

  useEffect(() => {
    // Check client-side authentication indicators
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
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t.navHome, icon: ShieldAlert },
    { href: '/reports', label: t.navReports, icon: FileText },
    { href: '/statistics', label: t.navStats, icon: BarChart3 },
    { href: '/join-us', label: t.navJoinUs, icon: Users },
  ];

  return (
    <>
      {/* Top Essential Human Rights Disclaimer Banner */}
      <div className="bg-canvas-subtle border-b border-canvas-border/60 py-1.5 px-4 text-xs text-brand-slate flex justify-between items-center text-center sm:text-left">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-brand-emerald font-medium mx-auto sm:mx-0">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span>{t.principles}</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-brand-text transition-colors">গোপনীয়তা নীতি</Link>
            <span>•</span>
            <Link href="/safety" className="hover:text-brand-text transition-colors">ডিজিটাল নিরাপত্তা</Link>
            <span>•</span>
            <Link href="/how-it-works" className="hover:text-brand-text transition-colors">যাচাই পদ্ধতি</Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-canvas-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-emerald to-emerald-900 border border-brand-emerald/40 flex items-center justify-center text-white shadow-lg shadow-brand-emerald/10 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-brand-text tracking-tight flex items-center gap-1.5">
                <span>{t.siteTitle}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                  Citizen Voice
                </span>
              </div>
              <div className="text-[11px] text-brand-slate hidden sm:block">
                মানবাধিকার ও নাগরিক অধিকার আর্কাইভ
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20'
                      : 'text-brand-slate hover:text-brand-text hover:bg-canvas-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Bilingual Switcher */}
            <button
              onClick={() => toggleLanguage()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-canvas-border text-xs text-brand-slate hover:text-brand-text hover:bg-canvas-card transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-brand-emerald" />
              <span className="font-semibold">{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Submit Complaint Button */}
            <Link
              href="/complaints/new"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-emerald hover:bg-brand-emeraldDark text-white text-sm font-semibold shadow-md shadow-brand-emerald/20 transition-all hover:shadow-brand-emerald/30 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.navSubmitComplaint}</span>
            </Link>

            {/* User / Staff Portal Link */}
            {userRole ? (
              <Link
                href={
                  userRole === 'superAdmin'
                    ? '/super-admin/dashboard'
                    : userRole === 'admin'
                    ? '/admin/dashboard'
                    : '/user/dashboard'
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-canvas-border text-brand-text hover:bg-canvas-card text-sm font-medium transition-colors"
              >
                {userRole === 'superAdmin' ? (
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                ) : userRole === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-brand-amber" />
                ) : (
                  <User className="w-4 h-4 text-brand-emerald" />
                )}
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-canvas-border text-brand-slate hover:text-brand-text hover:bg-canvas-card text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.navLogin}</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => toggleLanguage()}
              className="px-2 py-1 rounded border border-canvas-border text-xs text-brand-slate"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-canvas-border text-brand-text hover:bg-canvas-card"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-canvas-border bg-canvas-subtle p-4 space-y-3">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-slate hover:text-brand-text hover:bg-canvas-card"
                  >
                    <Icon className="w-4 h-4 text-brand-emerald" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-canvas-border flex flex-col gap-2">
              <Link
                href="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-emerald text-white text-sm font-bold shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t.navSubmitComplaint}</span>
              </Link>
              {userRole ? (
                <Link
                  href={
                    userRole === 'superAdmin'
                      ? '/super-admin/dashboard'
                      : userRole === 'admin'
                      ? '/admin/dashboard'
                      : '/user/dashboard'
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-canvas-border text-sm font-medium text-brand-text"
                >
                  <User className="w-4 h-4" />
                  <span>{t.navDashboard}</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-canvas-border text-sm font-medium text-brand-text"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t.navLogin}</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-brand-emerald/40 text-brand-emerald text-sm font-medium"
                  >
                    <span>{t.navRegister}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
