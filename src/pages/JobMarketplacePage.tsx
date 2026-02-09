import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Globe,
  Search,
  Plus,
  Download,
  ChevronDown,
  ChevronRight,
  Package,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type MarketplaceTab = 'contractors' | 'customer-jobs' | 'parts-catalog';

interface Contractor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  verified: boolean;
  available: boolean;
}

interface CustomerJob {
  id: string;
  title: string;
  customerName: string;
  location: string;
  budget: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
  postedDate: string;
  bids: number;
}

interface PartItem {
  id: string;
  name: string;
  sku: string;
  supplier: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const JobMarketplacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('contractors');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Mock Contractors Data
  const contractors: Contractor[] = useMemo(() => [
    { id: 'CON-001', name: 'John Smith Electrical', specialty: 'Electrician', rating: 4.9, completedJobs: 127, hourlyRate: 95, location: 'Sydney, NSW', verified: true, available: true },
    { id: 'CON-002', name: 'Pro Plumbing Services', specialty: 'Plumber', rating: 4.8, completedJobs: 203, hourlyRate: 110, location: 'Melbourne, VIC', verified: true, available: true },
    { id: 'CON-003', name: 'Advanced HVAC Solutions', specialty: 'HVAC Technician', rating: 4.7, completedJobs: 89, hourlyRate: 105, location: 'Brisbane, QLD', verified: true, available: false },
    { id: 'CON-004', name: 'Master Carpenters Co', specialty: 'Carpenter', rating: 5.0, completedJobs: 156, hourlyRate: 85, location: 'Perth, WA', verified: true, available: true },
  ], []);

  // Mock Customer Jobs Data
  const customerJobs: CustomerJob[] = useMemo(() => [
    { id: 'CJ-001', title: 'Office Electrical Rewiring', customerName: 'Acme Corp', location: 'Sydney CBD', budget: 8500, urgency: 'High', category: 'Electrical', postedDate: '2026-02-07', bids: 3 },
    { id: 'CJ-002', title: 'Restaurant Kitchen Plumbing', customerName: 'Italian Bistro', location: 'Melbourne', budget: 12000, urgency: 'Urgent', category: 'Plumbing', postedDate: '2026-02-08', bids: 5 },
    { id: 'CJ-003', title: 'Warehouse HVAC Installation', customerName: 'Logistics Plus', location: 'Brisbane', budget: 25000, urgency: 'Medium', category: 'HVAC', postedDate: '2026-02-06', bids: 2 },
    { id: 'CJ-004', title: 'Home Renovation Carpentry', customerName: 'John Doe', location: 'Perth', budget: 15000, urgency: 'Low', category: 'Carpentry', postedDate: '2026-02-05', bids: 7 },
  ], []);

  // Mock Parts Catalog Data
  const partsCatalog: PartItem[] = useMemo(() => [
    { id: 'PART-001', name: 'Industrial Circuit Breaker', sku: 'CB-200A', supplier: 'ElectroSupply Co', price: 245, stock: 47, category: 'Electrical', image: '' },
    { id: 'PART-002', name: 'Copper Pipe 15mm x 3m', sku: 'CP-15-3', supplier: 'Plumb Wholesale', price: 32, stock: 156, category: 'Plumbing', image: '' },
    { id: 'PART-003', name: 'HVAC Compressor Unit', sku: 'HV-COMP-500', supplier: 'CoolAir Parts', price: 1850, stock: 12, category: 'HVAC', image: '' },
    { id: 'PART-004', name: 'Oak Hardwood Flooring 1m²', sku: 'WOOD-OAK-1', supplier: 'Timber Masters', price: 95, stock: 89, category: 'Carpentry', image: '' },
    { id: 'PART-005', name: 'LED Downlight 12W', sku: 'LED-DL-12', supplier: 'ElectroSupply Co', price: 18, stock: 0, category: 'Electrical', image: '' },
  ], []);

  // Calculate stats
  const stats = useMemo(() => {
    const activeJobs = customerJobs.length;
    const availableContractors = contractors.filter((c) => c.available).length;
    const openBids = customerJobs.reduce((sum, job) => sum + job.bids, 0);
    const avgRating = contractors.length > 0 ? (contractors.reduce((sum, c) => sum + c.rating, 0) / contractors.length).toFixed(1) : '0.0';

    return { activeJobs, availableContractors, openBids, avgRating };
  }, [contractors, customerJobs]);

  // Filter data based on search
  const filteredContractors = useMemo(() => {
    return contractors.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contractors, searchTerm]);

  const filteredCustomerJobs = useMemo(() => {
    return customerJobs.filter((job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customerJobs, searchTerm]);

  const filteredParts = useMemo(() => {
    return partsCatalog.filter((part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partsCatalog, searchTerm]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      Low: { bg: 'bg-slate-100', text: 'text-slate-700' },
      Medium: { bg: 'bg-blue-100', text: 'text-blue-700' },
      High: { bg: 'bg-orange-100', text: 'text-orange-700' },
      Urgent: { bg: 'bg-red-100', text: 'text-red-700' },
    };

    const { bg, text } = config[urgency as keyof typeof config];

    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold uppercase`}>{urgency}</span>;
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Services</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Job Marketplace</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
            <Plus size={16} />
            {activeTab === 'contractors' ? 'Add Contractor' : activeTab === 'customer-jobs' ? 'Post Job' : 'Add Part'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Jobs</p>
          <p className="text-3xl font-black text-slate-900">{stats.activeJobs}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contractors</p>
          <p className="text-3xl font-black text-slate-900">{stats.availableContractors}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Open Bids</p>
          <p className="text-3xl font-black text-slate-900">{stats.openBids}</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Rating</p>
          <p className="text-3xl font-black text-slate-900">{stats.avgRating}</p>
        </div>
      </div>


      {/* Tab Selector & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === 'contractors'
                  ? 'Search contractors...'
                  : activeTab === 'customer-jobs'
                  ? 'Search jobs...'
                  : 'Search parts...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setActiveTab('contractors')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'contractors'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Contractors
          </button>
          <button
            onClick={() => setActiveTab('customer-jobs')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'customer-jobs'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('parts-catalog')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'parts-catalog'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Parts
          </button>
        </div>
      </div>

      {/* Contractors View */}
      {activeTab === 'contractors' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContractors.map((contractor) => (
            <div
              key={contractor.id}
              className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                    {contractor.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      {contractor.name}
                      {contractor.verified && (
                        <CheckCircle size={18} className="text-blue-600" />
                      )}
                    </h3>
                    <p className="text-sm text-slate-600">{contractor.specialty}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${contractor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {contractor.available ? 'Available' : 'Unavailable'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-black text-slate-900">{contractor.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Rating</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 mb-1">{contractor.completedJobs}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Jobs Done</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 mb-1">${contractor.hourlyRate}/hr</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">Rate</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <MapPin size={16} className="text-slate-400" />
                {contractor.location}
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  Contact
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
                  View
                </button>
              </div>
            </div>
          ))}

          {filteredContractors.length === 0 && (
            <div className="col-span-2 text-center py-20">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Contractors Found</h3>
              <p className="text-slate-500">Try adjusting your search or browse all contractors.</p>
            </div>
          )}
        </div>
      )}

      {/* Customer Jobs View */}
      {activeTab === 'customer-jobs' && (
        <div className="space-y-4">
          {filteredCustomerJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-slate-900">{job.title}</h3>
                    {getUrgencyBadge(job.urgency)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users size={16} className="text-slate-400" />
                      {job.customerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} className="text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-slate-400" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-600">${job.budget.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">{job.bids} bid{job.bids !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {job.category}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                  Place Bid
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}

          {filteredCustomerJobs.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase size={40} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Customer Jobs Found</h3>
              <p className="text-slate-500">Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      )}

      {/* Parts Catalog View */}
      {activeTab === 'parts-catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => (
            <div
              key={part.id}
              className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
                <Package size={48} className="text-slate-400" />
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{part.name}</h3>
              <p className="text-sm text-slate-600 mb-2">SKU: {part.sku}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {part.category}
                </span>
                {part.stock === 0 ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-sm text-slate-600">{part.stock} in stock</span>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-black text-slate-900">${part.price}</p>
                <p className="text-sm text-slate-500">{part.supplier}</p>
              </div>

              <button
                disabled={part.stock === 0}
                className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  part.stock === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5'
                }`}
              >
                {part.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}

          {filteredParts.length === 0 && (
            <div className="col-span-3 text-center py-20">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={40} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Parts Found</h3>
              <p className="text-slate-500">Try adjusting your search or browse all categories.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMarketplacePage;
