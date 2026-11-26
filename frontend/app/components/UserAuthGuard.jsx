'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserAuthGuard({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        const user = data.data?.user || data.user;
        if (user) {
          setAuthorized(true);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jonoshor_user');
        }
        router.replace('/login');
      });
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-blue border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">নিরাপত্তা যাচাই হচ্ছে... (Checking Authorization)</span>
      </div>
    );
  }

  return children;
}
