import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Users, Briefcase, Target, CheckSquare,
  Ticket, Calendar as CalendarIcon, Megaphone, Settings,
  Search, Bell, Plus, LayoutDashboard,
  Inbox, ChevronRight, Building2, Sparkles, LogOut, ChevronUp, ChevronDown, Clock, AlertCircle, DollarSign, MessageSquare, CreditCard, Package,
  RefreshCcw, MessageSquareText, Bug, Terminal, ShieldCheck, Database, X, Activity, HardDrive,
  Wrench, MapPin, Truck, Box, ShoppingCart, Landmark, Receipt, Star, Gift, ClipboardList, MessageCircle, Calculator,
  Zap, Webhook, FileText, Mail, BarChart3, PenTool, Layers, Cog, Link2, FolderOpen, CalendarCheck, User
} from 'lucide-react';

import SalesDashboard from './pages/SalesDashboard';
import OpsDashboard from './pages/OpsDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import FieldServicesDashboard from './pages/FieldServicesDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import ListView from './pages/ListView';
import EntityDetail from './pages/EntityDetail';
// TaskManagement removed - consolidated into MySchedule
import TicketManagement from './pages/TicketManagement';
import SupportHub from './pages/SupportHub';
import SupportTickets from './pages/SupportTickets';
import CalendarView from './pages/CalendarView';
import AIImageSuite from './pages/AIImageSuite';
import FinancialHub from './pages/Financials/FinancialHub';
import InvoicesList from './pages/Financials/InvoicesList';
import InvoiceDetail from './pages/Financials/InvoiceDetail';
import QuotesList from './pages/Financials/QuotesList';
import QuoteDetail from './pages/Financials/QuoteDetail';
import ProductDetail from './pages/ProductDetail';
import ServiceDetail from './pages/ServiceDetail';
import PurchaseLedger from './pages/Financials/PurchaseLedger';
import SubscriptionsList from './pages/Financials/SubscriptionsList';
import ItemsCatalog from './pages/Financials/ItemsCatalog';
import BankFeed from './pages/Financials/BankFeed';
import ExpensesList from './pages/Financials/ExpensesList';
import TacticalQueue from './pages/Operations/TacticalQueue';
import DispatchMatrix from './pages/Logistics/DispatchMatrix';
import InboundEngine from './pages/Marketing/InboundEngine';
import ReferralEngine from './pages/Marketing/ReferralEngine';
import ReputationManager from './pages/Marketing/ReputationManager';
import TeamChat from './pages/TeamChat';
import SettingsView from './pages/SettingsView';
import Diagnostics from './pages/Diagnostics';
import CommsHub from './pages/CommsHub';
import Reports from './pages/Reports';
import AIWritingTools from './pages/AIWritingTools';
import BlueprintListPage from './pages/BlueprintListPage';
import BlueprintDetailPage from './pages/BlueprintDetailPage';
import MySchedule from './pages/MySchedule';
import DealsPage from './pages/DealsPage';
import LeadsPage from './pages/LeadsPage';
import ContactsPage from './pages/ContactsPage';
import AccountsPage from './pages/AccountsPage';
import CampaignsPage from './pages/CampaignsPage';
import JobsPage from './pages/JobsPage';
import CrewsPage from './pages/CrewsPage';
import EquipmentPage from './pages/EquipmentPage';
import ZonesPage from './pages/ZonesPage';
import InventoryPage from './pages/InventoryPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import WarehousePage from './pages/WarehousePage';
import ProcurementPage from './pages/ProcurementPage';
import JobMarketplacePage from './pages/JobMarketplacePage';
import CustomEntityListPage from './pages/CustomEntityListPage';
import RecordModal from './components/RecordModal';
import DebugPanel from './components/DebugPanel';
import { ResetDemoButton, DataSourceIndicator } from './components/ResetDemoButton';
import { CRMProvider, useCRM } from './context/CRMContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DemoMode } from './pages/DemoMode';
import ComponentShowcase from './pages/ComponentShowcase';

// Context for managing expandable nav groups - click outside collapses them
const NavContext = React.createContext<{
  openGroups: Set<string>;
  toggleGroup: (id: string) => void;
  closeAllGroups: () => void;
}>({
  openGroups: new Set(),
  toggleGroup: () => {},
  closeAllGroups: () => {}
});

// New modern fish-hook brand icon
export const HookIcon = ({ size = 18, className = "", strokeWidth = 3 }: { size?: number, className?: string, strokeWidth?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="17" cy="4" r="1.2" fill="currentColor" />
    <path d="M17 5.5v10.5c0 3.3-2.7 6-6 6s-6-2.7-6-6v-2" />
  </svg>
);

const SidebarSection = ({ title, children }: { title: string, children?: React.ReactNode }) => {
  const { settings } = useCRM();
  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  return (
    <div className="mb-6">
      <h3 className={`px-4 mb-2 text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const NavItem = ({ to, icon: Icon, label, badge, highlight, exact }: { to: string, icon: any, label: string, badge?: string | number, highlight?: boolean, exact?: boolean }) => {
  const location = useLocation();
  const { settings } = useCRM();
  // For exact match or overview pages, only match exact path
  // For other routes, allow startsWith matching
  const active = exact || to.includes('overview') || to.endsWith('/financials') || to.endsWith('/sales') || to.endsWith('/ops') || to.endsWith('/marketing')
    ? location.pathname === to
    : location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
        active
          ? 'nav-item-active text-white shadow-lg shadow-blue-500/20'
          : highlight
            ? (isDarkMode ? 'text-blue-300 bg-white/10 hover:bg-white/20' : 'text-blue-600 bg-blue-50/50 hover:bg-blue-50')
            : (isDarkMode ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')
      }`}
    >
      <Icon size={18} className={active ? 'text-white' : highlight ? 'text-blue-500' : (isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-blue-500')} />
      <span className="text-sm font-semibold">{label}</span>
      {badge && (
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md ${active ? 'bg-white/20' : (isDarkMode ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600')}`}>
          {badge}
        </span>
      )}
      {!badge && active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </Link>
  );
};

// Expandable nav group with sub-items - uses NavContext for click-outside collapse
const ExpandableNavGroup = ({
  icon: Icon,
  label,
  basePath,
  children,
  id
}: {
  icon: any;
  label: string;
  basePath: string;
  children: React.ReactNode;
  id?: string;
}) => {
  const location = useLocation();
  const { settings } = useCRM();
  const { openGroups, toggleGroup } = React.useContext(NavContext);
  const isInSection = location.pathname.startsWith(basePath);
  const groupId = id || basePath;
  // Allow manual control - only auto-expand if not manually closed
  const isManuallyOpen = openGroups.has(groupId);
  const isOpen = isManuallyOpen;
  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  // Auto-expand when navigating into section
  useEffect(() => {
    if (isInSection && !openGroups.has(groupId)) {
      toggleGroup(groupId);
    }
  }, [isInSection, groupId]);

  const navigate = useNavigate();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to base path and expand submenu
    navigate(basePath);
    if (!isOpen) {
      toggleGroup(groupId);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
          isInSection && !isOpen
            ? 'nav-item-active text-white shadow-lg shadow-blue-500/20'
            : isDarkMode
              ? 'text-slate-300 hover:bg-white/10 hover:text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon size={18} className={isInSection && !isOpen ? 'text-white' : (isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-blue-500')} />
        <span className="text-sm font-semibold">{label}</span>
        <ChevronUp
          size={14}
          className={`ml-auto transition-transform duration-200 ${isOpen ? '' : 'rotate-180'} ${isInSection && !isOpen ? 'text-white/70' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
        />
      </button>
      {isOpen && (
        <div className={`ml-4 mt-1 pl-4 space-y-1 animate-slide-up ${isDarkMode ? 'border-l-2 border-white/20' : 'border-l-2 border-slate-100'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Sub-nav item (smaller, indented)
const SubNavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const { settings } = useCRM();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
        active
          ? (isDarkMode ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600')
          : (isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700')
      }`}
    >
      <Icon size={14} className={active ? (isDarkMode ? 'text-white' : 'text-blue-500') : (isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-blue-500')} />
      <span className="text-xs font-bold">{label}</span>
      {active && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white' : 'bg-blue-500'}`} />}
    </Link>
  );
};

// Nested expandable group (for sub-sub menus like Ledger > Income)
const NestedExpandableGroup = ({
  icon: Icon,
  label,
  basePath,
  children
}: {
  icon: any;
  label: string;
  basePath: string;
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const { settings } = useCRM();
  const isInSection = location.pathname.startsWith(basePath);
  const [isOpen, setIsOpen] = useState(isInSection);
  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  useEffect(() => {
    if (isInSection) setIsOpen(true);
  }, [isInSection]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
          isInSection
            ? (isDarkMode ? 'text-white' : 'text-blue-600')
            : (isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700')
        }`}
      >
        <Icon size={14} className={isInSection ? (isDarkMode ? 'text-white' : 'text-blue-500') : (isDarkMode ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-blue-500')} />
        <span className="text-xs font-bold">{label}</span>
        <ChevronDown
          size={12}
          className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className={`ml-3 mt-1 pl-3 space-y-0.5 ${isDarkMode ? 'border-l border-white/20' : 'border-l border-slate-100'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Tiny sub-nav item for nested menus
const TinyNavItem = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const { settings } = useCRM();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  const isDarkMode = settings.branding?.sidebarMode === 'dark' || settings.branding?.sidebarMode === 'brand';

  return (
    <Link
      to={to}
      className={`block px-3 py-1.5 rounded text-[11px] font-bold transition-all ${
        active
          ? (isDarkMode ? 'text-white bg-white/20' : 'text-blue-600 bg-blue-50/50')
          : (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')
      }`}
    >
      {label}
    </Link>
  );
};

const Header = ({ showDebug, setShowDebug }: { showDebug: boolean, setShowDebug: (v: boolean) => void }) => {
  const { searchQuery, setSearchQuery, openModal, globalSearchResults, settings, hasPermission } = useCRM();
  const { user, signOut } = useAuth();
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isDarkMode = settings.branding?.theme === 'dark';

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Get user display name and initials
  const userEmail = user?.email || 'demo@example.com';
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail.split('@')[0];
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className={`h-16 border-b backdrop-blur-md flex items-center justify-between px-8 z-[60] relative ${
      isDarkMode
        ? 'border-slate-700 bg-slate-800/80 text-slate-100'
        : 'border-slate-200 bg-white/80 text-slate-900'
    }`}>
      {settings.organization?.legalName && (
        <div className="mr-6">
          <p className={`text-xs font-black tracking-tight leading-none ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            {settings.organization.legalName}
          </p>
          {settings.branding?.slogan && (
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {settings.branding.slogan}
            </p>
          )}
        </div>
      )}
      <div className="flex-1 max-w-xl relative group">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'
        }`} size={16} />
        <input
          type="text"
          placeholder="Search records (⌘ F)"
          className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-4 transition-all text-sm font-medium ${
            isDarkMode
              ? 'bg-slate-700/50 border-slate-600 focus:ring-blue-500/20 focus:border-blue-500 text-slate-100 placeholder-slate-400'
              : 'bg-slate-100/50 border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 text-slate-900 placeholder-slate-400'
          }`}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && searchQuery.trim() && (
          <div className={`absolute top-full left-0 w-full mt-2 border rounded-2xl shadow-2xl z-[70] overflow-hidden animate-slide-up ${
            isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-slate-200'
          }`}>
            <div className={`p-3 border-b flex justify-between items-center ${
              isDarkMode
                ? 'bg-slate-700/50 border-slate-600'
                : 'bg-slate-50 border-slate-100'
            }`}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search Results</span>
              <span className="text-[10px] font-bold text-blue-600">{globalSearchResults.length} found</span>
            </div>
            {globalSearchResults.map(res => (
              <button
                key={res.id}
                onClick={() => {
                  navigate(res.link);
                  setShowResults(false);
                  setSearchQuery('');
                }}
                className={`w-full text-left px-4 py-3 border-b last:border-0 transition-colors flex items-center justify-between ${
                  isDarkMode
                    ? 'hover:bg-slate-700/50 border-slate-700'
                    : 'hover:bg-slate-50 border-slate-50'
                }`}
              >
                <div>
                  <p className={`text-sm font-black leading-none mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {res.title}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{res.subtitle}</p>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {/* Data Source Indicator - shows connection status */}
        <DataSourceIndicator className={isDarkMode ? 'text-slate-400' : ''} />

        {/* Reset Demo Button - only shows when connected to Supabase */}
        <ResetDemoButton variant="minimal" className={isDarkMode ? 'text-slate-400 hover:text-slate-200' : ''} />

        <div className={`w-px h-6 ${isDarkMode ? 'bg-slate-600' : 'bg-slate-200'}`} />

        <button
          onClick={() => navigate('/settings/diagnostics')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isDarkMode
              ? 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-blue-400'
              : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
          title="System Diagnostics"
        >
          <Activity size={20} />
        </button>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            showDebug
              ? 'bg-slate-900 text-white shadow-lg'
              : isDarkMode
                ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <Bug size={20} />
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
              showUserMenu
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
            title={userName}
          >
            {userInitials}
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 top-full mt-2 w-64 border rounded-2xl shadow-2xl z-[100] overflow-hidden animate-slide-up ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              {/* User Info Header */}
              <div className={`p-4 border-b ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {userName}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <User size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                  <span className="text-sm font-medium">My Profile</span>
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Settings size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/my-schedule'); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <CalendarCheck size={16} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
                  <span className="text-sm font-medium">My Schedule</span>
                </button>
              </div>

              {/* Logout */}
              <div className={`p-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'
                  }`}
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const AppContent: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const sidebarRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { settings, activeBlueprint } = useCRM(); // Access settings for feature flag gates

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Close all non-active groups (preserve groups where user is currently navigated)
  const closeNonActiveGroups = () => {
    setOpenGroups(prev => {
      const next = new Set<string>();
      // Keep groups that match current path
      prev.forEach(groupId => {
        if (location.pathname.startsWith(groupId) || location.pathname.includes(groupId)) {
          next.add(groupId);
        }
      });
      return next;
    });
  };

  const closeAllGroups = () => {
    setOpenGroups(new Set());
  };

  // Close non-active groups when clicking on main content area
  const handleMainClick = () => {
    closeNonActiveGroups();
  };

  return (
    <NavContext.Provider value={{ openGroups, toggleGroup, closeAllGroups }}>
    <>
      {/* Dynamic Branding Styles */}
      <style>{`
        :root {
          --brand-primary: ${settings.branding?.primaryColor || '#3B82F6'};
        }
        /* Apply primary color to key UI elements */
        .bg-blue-600 { background-color: var(--brand-primary) !important; }
        .text-blue-600 { color: var(--brand-primary) !important; }
        .border-blue-600 { border-color: var(--brand-primary) !important; }
        .hover\\:bg-blue-700:hover { background-color: var(--brand-primary) !important; filter: brightness(0.9); }
        .hover\\:text-blue-600:hover { color: var(--brand-primary) !important; }
        .shadow-blue-500\\/20 { box-shadow: 0 10px 15px -3px ${settings.branding?.primaryColor || '#3B82F6'}33 !important; }
      `}</style>
      <div className={`flex h-screen overflow-hidden ${
        settings.branding?.theme === 'dark'
          ? 'bg-slate-900 text-slate-100'
          : 'bg-[#f8fafc] text-slate-900'
      }`}>
        <aside
          ref={sidebarRef}
          className={`w-64 border-r flex flex-col shrink-0 z-[100] shadow-2xl ${
            settings.branding?.sidebarMode === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white shadow-slate-900/50'
              : settings.branding?.sidebarMode === 'brand'
              ? 'border-slate-800 text-white shadow-slate-900/50'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
          style={settings.branding?.sidebarMode === 'brand' ? { backgroundColor: settings.branding.primaryColor || '#3B82F6' } : {}}
        >
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                settings.branding?.sidebarMode === 'light' ? 'bg-blue-600' : 'bg-white/20'
              }`}>
                <HookIcon className="text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-black tracking-tighter leading-none ${
                  settings.branding?.sidebarMode === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  {settings.branding?.name || 'Catcha'}
                  <span className="text-blue-500">CRM</span>
                </h1>
                <p className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${
                  settings.branding?.sidebarMode === 'light' ? 'text-slate-400' : 'text-white/60'
                }`}>
                  {settings.branding?.slogan || 'CATCH. CONNECT. CLOSE.'}
                </p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
            {/* 1. MY WORK - Personal workspace at top */}
            <SidebarSection title="MY WORK">
              <NavItem to="/my-schedule" icon={CalendarCheck} label="My Schedule" />
              <NavItem to="/calendar" icon={CalendarIcon} label="My Calendar" />
            </SidebarSection>

            {/* 2. SALES - Clean and simple */}
            {settings.modules?.salesEngine && (
              <SidebarSection title="SALES">
                <NavItem to="/sales" icon={LayoutDashboard} label="Sales Pulse" exact />
                <NavItem to="/leads" icon={Target} label="Leads" />
                <NavItem to="/deals" icon={Briefcase} label="Deals" />
                <NavItem to="/accounts" icon={Building2} label="Accounts" />
                <NavItem to="/contacts" icon={Users} label="Contacts" />
              </SidebarSection>
            )}

            {/* INDUSTRY-SPECIFIC ENTITIES */}
            {activeBlueprint.customEntities && activeBlueprint.customEntities.length > 0 && (
              <SidebarSection title={activeBlueprint.name.toUpperCase()}>
                {activeBlueprint.customEntities.map(entity => (
                  <NavItem
                    key={entity.id}
                    to={`/custom/${entity.id}`}
                    icon={Layers}
                    label={entity.namePlural}
                  />
                ))}
              </SidebarSection>
            )}

            {/* 3. FINANCIALS - Now its own section */}
            {settings.modules?.financials && (
              <SidebarSection title="FINANCIALS">
                <NavItem to="/financials" icon={LayoutDashboard} label="Finance Hub" exact />
                <ExpandableNavGroup icon={Receipt} label="Ledger" basePath="/financials/ledger" id="ledger">
                  <TinyNavItem to="/financials/ledger/income" label="Income" />
                  <TinyNavItem to="/financials/ledger/quotes" label="Quotes" />
                  <TinyNavItem to="/financials/ledger/purchases" label="Purchases" />
                  <TinyNavItem to="/financials/ledger/expenses" label="Expenses" />
                  {settings.modules?.bankFeeds && <TinyNavItem to="/financials/ledger/bank" label="Bank Feed" />}
                </ExpandableNavGroup>
                {settings.modules?.subscriptions && <NavItem to="/financials/billing" icon={RefreshCcw} label="Billing" />}
                <ExpandableNavGroup icon={Package} label="Catalog" basePath="/financials/catalog" id="catalog">
                  <TinyNavItem to="/financials/catalog?tab=products" label="Products" />
                  <TinyNavItem to="/financials/catalog?tab=services" label="Services" />
                </ExpandableNavGroup>
              </SidebarSection>
            )}

            {/* 4. OPERATIONS - Streamlined */}
            <SidebarSection title="OPERATIONS">
              <NavItem to="/ops" icon={LayoutDashboard} label="Ops Pulse" exact />
              <NavItem to="/ops/tactical-queue" icon={AlertCircle} label="Tactical Queue" />
              <NavItem to="/ops/support-inbox" icon={Ticket} label="Support Tickets" />
              <NavItem to="/ops/comms-hub" icon={Mail} label="Comms Hub" />
              <NavItem to="/ops/reports" icon={BarChart3} label="Reports" />
              <NavItem to="/chat" icon={MessageSquareText} label="Team Chat" />
            </SidebarSection>

            {/* 5. MARKETING */}
            {settings.modules?.marketing && (
              <SidebarSection title="MARKETING">
                <NavItem to="/marketing" icon={LayoutDashboard} label="Growth Hub" exact />
                <NavItem to="/campaigns" icon={Megaphone} label="Campaigns" />
                {settings.modules?.inboundForms && <NavItem to="/marketing/inbound-engine" icon={Inbox} label="Inbound Engine" />}
                {settings.modules?.referrals && <NavItem to="/marketing/referral-engine" icon={Gift} label="Referral Engine" />}
                {settings.modules?.reputation && <NavItem to="/marketing/reputation" icon={Star} label="Reputation" />}
                <NavItem to="/marketing/ai-tools" icon={PenTool} label="AI Writing Tools" />
              </SidebarSection>
            )}

            {/* 6. FIELD & LOGISTICS - Restructured */}
            {settings.modules?.fieldLogistics && (
              <SidebarSection title="FIELD & LOGISTICS">
                <NavItem to="/field-services" icon={LayoutDashboard} label="Field Pulse" exact />
                {settings.modules?.dispatch && <NavItem to="/logistics/dispatch-matrix" icon={Activity} label="Dispatch Matrix" />}
                <ExpandableNavGroup icon={Wrench} label="Jobs" basePath="/jobs" id="jobs">
                  <SubNavItem to="/jobs" icon={ClipboardList} label="All Jobs" />
                  <SubNavItem to="/logistics/job-marketplace" icon={Briefcase} label="Job Marketplace" />
                </ExpandableNavGroup>
                <ExpandableNavGroup icon={Users} label="Resources" basePath="/resources" id="resources">
                  <SubNavItem to="/crews" icon={Users} label="Crews" />
                  <SubNavItem to="/equipment" icon={Truck} label="Equipment" />
                  <SubNavItem to="/zones" icon={MapPin} label="Zones" />
                  {settings.modules?.inventory && <SubNavItem to="/inventory" icon={Box} label="Inventory" />}
                </ExpandableNavGroup>
                {settings.modules?.purchaseOrders && (
                  <ExpandableNavGroup icon={Package} label="Supply Chain" basePath="/supply-chain" id="supply-chain">
                    <SubNavItem to="/logistics/warehouse" icon={HardDrive} label="Warehouse" />
                    <SubNavItem to="/logistics/procurement" icon={ShoppingCart} label="Procurement" />
                    <SubNavItem to="/purchase-orders" icon={Package} label="Purchase Orders" />
                  </ExpandableNavGroup>
                )}
              </SidebarSection>
            )}

            {/* 7. SYSTEM - Settings with submenus + standalone Diagnostics */}
            <SidebarSection title="SYSTEM">
              <ExpandableNavGroup icon={Settings} label="Settings" basePath="/settings" id="settings">
                <SubNavItem to="/settings" icon={Cog} label="General" />
                <SubNavItem to="/settings/modules" icon={Layers} label="Modules" />
                <SubNavItem to="/settings/users" icon={Users} label="Users & Access" />
                <SubNavItem to="/settings/integrations" icon={Link2} label="Integrations" />
                <SubNavItem to="/settings/automation" icon={Zap} label="Automation" />
              </ExpandableNavGroup>
              <NavItem to="/blueprints" icon={Sparkles} label="Blueprints" />
              <NavItem to="/diagnostics" icon={Activity} label="System Health" />
            </SidebarSection>
          </nav>
        </aside>
        <main className={`flex-1 flex flex-col min-w-0 overflow-hidden relative ${
          settings.branding?.theme === 'dark' ? 'bg-slate-900' : 'bg-white'
        }`} onClick={handleMainClick}>
          <Header showDebug={showDebug} setShowDebug={setShowDebug} />
          <section className={`flex-1 overflow-y-auto p-8 custom-scrollbar relative ${
            settings.branding?.theme === 'dark' ? 'bg-slate-800/30' : 'bg-slate-50/30'
          }`}>
            <Routes>
              <Route path="/" element={<Navigate to="/my-schedule" replace />} />
              <Route path="/my-schedule" element={<MySchedule />} />
              <Route path="/sales" element={<SalesDashboard />} />
              <Route path="/ops" element={<OpsDashboard />} />
              <Route path="/marketing" element={<MarketingDashboard />} />
              <Route path="/field-services" element={<FieldServicesDashboard />} />
              <Route path="/logistics-hub" element={<LogisticsDashboard />} />
              <Route path="/ai-suite" element={<AIImageSuite />} />

              <Route path="/financials" element={<FinancialHub />} />

              {/* Ledger Section - consolidated financial records */}
              <Route path="/financials/ledger/income" element={<InvoicesList />} />
              <Route path="/financials/ledger/income/:id" element={<InvoiceDetail />} />
              <Route path="/financials/ledger/quotes" element={<QuotesList />} />
              <Route path="/financials/ledger/quotes/:id" element={<QuoteDetail />} />
              <Route path="/financials/ledger/purchases" element={<PurchaseLedger />} />
              <Route path="/financials/ledger/expenses" element={<ExpensesList />} />
              <Route path="/financials/ledger/bank" element={<BankFeed />} />

              {/* Billing Section - subscriptions & recurring */}
              <Route path="/financials/billing" element={<SubscriptionsList />} />

              {/* Catalog Section - products, services */}
              <Route path="/financials/catalog" element={<ItemsCatalog />} />
              <Route path="/financials/catalog/products/:id" element={<ProductDetail />} />
              <Route path="/financials/catalog/services/:id" element={<ServiceDetail />} />

              {/* Legacy redirects for backward compatibility */}
              <Route path="/financials/income-ledger" element={<Navigate to="/financials/ledger/income" replace />} />
              <Route path="/financials/income-ledger/:id" element={<Navigate to="/financials/ledger/income/:id" replace />} />
              <Route path="/financials/invoices" element={<Navigate to="/financials/ledger/income" replace />} />
              <Route path="/financials/invoices/:id" element={<Navigate to="/financials/ledger/income/:id" replace />} />
              <Route path="/financials/quotes" element={<Navigate to="/financials/ledger/quotes" replace />} />
              <Route path="/financials/purchase-ledger" element={<Navigate to="/financials/ledger/purchases" replace />} />
              <Route path="/financials/bank-feed" element={<Navigate to="/financials/ledger/bank" replace />} />
              <Route path="/financials/items-catalog" element={<Navigate to="/financials/catalog" replace />} />
              <Route path="/financials/items" element={<Navigate to="/financials/catalog" replace />} />
              <Route path="/financials/products/:id" element={<Navigate to="/financials/catalog/products/:id" replace />} />
              <Route path="/financials/services/:id" element={<Navigate to="/financials/catalog/services/:id" replace />} />
              <Route path="/financials/subscriptions" element={<Navigate to="/financials/billing" replace />} />
              <Route path="/financials/expenses" element={<Navigate to="/financials/ledger/expenses" replace />} />

              <Route path="/ops/tactical-queue" element={<TacticalQueue />} />
              <Route path="/ops/support-inbox" element={<SupportTickets />} />
              <Route path="/ops/comms-hub" element={<CommsHub />} />
              <Route path="/ops/reports" element={<Reports />} />
              <Route path="/tickets" element={<Navigate to="/ops/support-inbox" replace />} />
              <Route path="/tickets/:id" element={<EntityDetail type="tickets" />} />

              <Route path="/logistics/warehouse" element={<WarehousePage />} />
              <Route path="/logistics/procurement" element={<ProcurementPage />} />
              <Route path="/logistics/job-marketplace" element={<JobMarketplacePage />} />
              <Route path="/logistics/dispatch-matrix" element={<DispatchMatrix />} />

              <Route path="/marketing/reputation" element={<ReputationManager />} />
              <Route path="/marketing/referral-engine" element={<ReferralEngine />} />
              <Route path="/marketing/inbound-engine" element={<InboundEngine />} />
              <Route path="/marketing/ai-tools" element={<AIWritingTools />} />

              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />

              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/crews" element={<CrewsPage />} />
              <Route path="/zones" element={<ZonesPage />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />

              {/* Legacy routes - redirect to new paths */}
              <Route path="/bank-transactions" element={<Navigate to="/financials/bank-feed" replace />} />
              <Route path="/expenses" element={<Navigate to="/financials/expenses" replace />} />
              <Route path="/reviews" element={<Navigate to="/marketing/reputation" replace />} />
              <Route path="/referrals" element={<Navigate to="/marketing/referral-engine" replace />} />
              <Route path="/forms" element={<Navigate to="/marketing/inbound-engine" replace />} />
              <Route path="/chat-widgets" element={<Navigate to="/marketing/inbound-engine" replace />} />
              <Route path="/calculators" element={<Navigate to="/marketing/inbound-engine" replace />} />

              {/* Keep these accessible but not in main nav */}
              <Route path="/workflows" element={<ListView module="automationWorkflows" />} />
              <Route path="/webhooks" element={<ListView module="webhooks" />} />
              <Route path="/templates" element={<ListView module="industryTemplates" />} />

              {/* Detail routes */}
              <Route path="/leads/:id" element={<EntityDetail type="leads" />} />
              <Route path="/deals/:id" element={<EntityDetail type="deals" />} />
              <Route path="/accounts/:id" element={<EntityDetail type="accounts" />} />
              <Route path="/contacts/:id" element={<EntityDetail type="contacts" />} />
              <Route path="/campaigns/:id" element={<EntityDetail type="campaigns" />} />
              <Route path="/jobs/:id" element={<EntityDetail type="jobs" />} />
              <Route path="/crews/:id" element={<EntityDetail type="crews" />} />
              <Route path="/zones/:id" element={<EntityDetail type="zones" />} />
              <Route path="/equipment/:id" element={<EntityDetail type="equipment" />} />
              <Route path="/inventory/:id" element={<EntityDetail type="inventoryItems" />} />
              <Route path="/purchase-orders/:id" element={<EntityDetail type="purchaseOrders" />} />
              <Route path="/financials/bank-feed/:id" element={<EntityDetail type="bankTransactions" />} />
              <Route path="/financials/expenses/:id" element={<EntityDetail type="expenses" />} />
              <Route path="/marketing/reputation/:id" element={<EntityDetail type="reviews" />} />
              <Route path="/marketing/referral-engine/:id" element={<EntityDetail type="referralRewards" />} />
              <Route path="/workflows/:id" element={<EntityDetail type="automationWorkflows" />} />
              <Route path="/webhooks/:id" element={<EntityDetail type="webhooks" />} />
              <Route path="/templates/:id" element={<EntityDetail type="industryTemplates" />} />

              {/* Custom entity routes */}
              <Route path="/custom/:entityType" element={<CustomEntityListPage />} />
              <Route path="/custom/:entityType/:id" element={<EntityDetail />} />

              <Route path="/tasks" element={<Navigate to="/my-schedule" replace />} />
              <Route path="/tasks/:id" element={<EntityDetail type="tasks" />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/chat" element={<TeamChat />} />

              {/* Settings with sub-tabs via URL */}
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/settings/modules" element={<SettingsView initialTab="MODULES" />} />
              <Route path="/settings/users" element={<SettingsView initialTab="USERS_ACCESS" />} />
              <Route path="/settings/integrations" element={<SettingsView initialTab="INTEGRATIONS" />} />
              <Route path="/settings/automation" element={<SettingsView initialTab="AUTOMATION" />} />
              <Route path="/settings/diagnostics" element={<SettingsView initialTab="DIAGNOSTICS" />} />

              {/* Blueprint Management */}
              <Route path="/blueprints" element={<BlueprintListPage />} />
              <Route path="/blueprints/:blueprintId" element={<BlueprintDetailPage />} />

              {/* Standalone Diagnostics page (full system health view) */}
              <Route path="/diagnostics" element={<Diagnostics />} />

              <Route path="/showcase" element={<ComponentShowcase />} />
              <Route path="*" element={<Navigate to="/sales" replace />} />
            </Routes>
            <RecordModal />
            {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
          </section>
        </main>
      </div>
    </>
    </NavContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CRMProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            }
          />
          <Route path="/demo" element={<DemoMode />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </CRMProvider>
    </AuthProvider>
  );
};

export default App;