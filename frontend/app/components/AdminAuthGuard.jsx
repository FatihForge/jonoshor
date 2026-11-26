'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(pathname === '/admin/login');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        const user = data.data?.user || data.user;
        if (user && (user.accountType === 'admin' || user.accountType === 'superadmin' || user.accountType === 'superAdmin')) {
          setAuthorized(true);
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jonoshor_user');
        }
        router.replace('/admin/login');
      });
  }, [router, pathname]);

  if (!authorized && pathname !== '/admin/login') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">অ্যাডমিন প্রিভিলেজ যাচাই হচ্ছে... (Verifying Admin Privileges)</span>
      </div>
    );
  }

  return children;
}
