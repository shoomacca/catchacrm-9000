/**
 * Reset Demo Button Component
 *
 * Shows a button to reset demo data when in demo mode.
 * Only visible when connected to Supabase in demo mode.
 */

import React, { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Database } from 'lucide-react';
import { useCRM } from '../context/CRMContext';

interface ResetDemoButtonProps {
  variant?: 'button' | 'banner' | 'minimal';
  className?: string;
}

export const ResetDemoButton: React.FC<ResetDemoButtonProps> = ({
  variant = 'button',
  className = ''
}) => {
  const { resetSupabaseDemo, dataSource, isSupabaseConnected } = useCRM();
  const [isResetting, setIsResetting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Only show when connected to Supabase
  if (!isSupabaseConnected) {
    return null;
  }

  const handleReset = async () => {
    if (isResetting) return;

    setIsResetting(true);
    setResult(null);

    try {
      const res = await resetSupabaseDemo();
      setResult(res);

      // Clear result after 3 seconds
      setTimeout(() => setResult(null), 3000);
    } catch (err) {
      setResult({ success: false, message: 'Reset failed' });
    } finally {
      setIsResetting(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">
            Demo Mode - Connected to Supabase
          </span>
        </div>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md text-sm transition-colors disabled:opacity-50"
        >
          {isResetting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resetting...
            </>
          ) : result ? (
            result.success ? (
              <>
                <Check className="w-4 h-4" />
                Reset Complete
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Failed
              </>
            )
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Reset Demo Data
            </>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleReset}
        disabled={isResetting}
        className={`text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 ${className}`}
        title="Reset demo data to initial state"
      >
        <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
        {isResetting ? 'Resetting...' : 'Reset Demo'}
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isResetting ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Resetting Demo...
        </>
      ) : result ? (
        result.success ? (
          <>
            <Check className="w-4 h-4" />
            Reset Complete!
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            {result.message}
          </>
        )
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Reset Demo Data
        </>
      )}
    </button>
  );
};

// Data source indicator component
export const DataSourceIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { dataSource, isSupabaseConnected } = useCRM();

  const getIndicator = () => {
    switch (dataSource) {
      case 'supabase':
        return {
          color: 'bg-green-500',
          text: 'Supabase',
          icon: <Database className="w-3 h-3" />
        };
      case 'localStorage':
        return {
          color: 'bg-amber-500',
          text: 'Local Storage',
          icon: null
        };
      case 'loading':
        return {
          color: 'bg-gray-400',
          text: 'Loading...',
          icon: <RefreshCw className="w-3 h-3 animate-spin" />
        };
    }
  };

  const indicator = getIndicator();

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${indicator.color}`} />
      <span className="flex items-center gap-1">
        {indicator.icon}
        {indicator.text}
      </span>
    </div>
  );
};

export default ResetDemoButton;
