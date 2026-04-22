import { useState, useEffect } from 'react';
import API from '../services/api';

export default function WakeUpBanner() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaking(true), 10000);
    API.get('/health').then(() => clearTimeout(timer)).catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  if (!waking) return null;
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-100 border-b border-amber-300 text-amber-800 text-sm text-center py-2 z-50">
      ⏳ Hệ thống đang khởi động, vui lòng chờ vài giây...
    </div>
  );
}
