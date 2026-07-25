'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin?tab=orders');
  }, [router]);

  return null;
}
