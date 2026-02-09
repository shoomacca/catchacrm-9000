import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

/**
 * Demo Mode
 *
 * This page allows users to access the CRM without authentication.
 * Data is stored in localStorage and resets every 24 hours.
 *
 * This bypasses Supabase auth and uses the legacy localStorage-based context.
 */
export const DemoMode: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set demo mode flag in localStorage
    localStorage.setItem('catchacrm_demo_mode', 'true');
    localStorage.setItem('catchacrm_demo_start', new Date().toISOString());

    // Redirect to app after a brief delay
    const timer = setTimeout(() => {
      navigate('/sales', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Entering Demo Mode</h2>
          <p className="text-slate-600 mb-6">
            Setting up your demo environment...
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-left">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-amber-900">
              <p className="font-bold mb-1">Demo Mode Active</p>
              <ul className="text-xs space-y-1 text-amber-800">
                <li>• Data stored locally in your browser</li>
                <li>• Demo resets every 24 hours</li>
                <li>• No authentication required</li>
                <li>• For evaluation purposes only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
