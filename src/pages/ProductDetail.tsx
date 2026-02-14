import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import {
  Package, ChevronLeft, Edit3, Trash2, DollarSign,
  Barcode, Tag, Box, TrendingDown, AlertTriangle,
  Factory, Truck, Calendar, Shield, Ruler, Weight,
  Image as ImageIcon, Star
} from 'lucide-react';
import { ProductComposer } from '../components/ProductComposer';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, deleteRecord } = useCRM();

  const [showProductComposer, setShowProductComposer] = useState(false);
  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-400">Product not found</p>
          <button
            onClick={() => navigate('/financials/catalog')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-black uppercase"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      deleteRecord('products', product.id);
      navigate('/financials/catalog');
    }
  };

  const stockStatus = product.stockLevel && product.reorderPoint
    ? product.stockLevel <= product.reorderPoint
      ? 'Low Stock'
      : 'In Stock'
    : 'Unknown';

  const stockStatusColor = stockStatus === 'Low Stock'
    ? 'bg-amber-100 text-amber-600 border-amber-200'
    : stockStatus === 'In Stock'
    ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/financials/catalog')}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{product.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProductComposer(true)}
            className="p-3 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
          >
            <Edit3 size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden shadow-sm">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Package size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{product.name}</h2>
                {product.description && (
                  <p className="text-blue-100 font-bold mt-1">{product.description}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 font-bold text-sm">Unit Price</p>
              <p className="text-3xl font-black text-white">${product.unitPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* SKU */}
            {product.sku && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Barcode size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">SKU</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{product.sku}</p>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Category</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{product.category}</p>
              </div>
            )}

            {/* Type */}
            {(product.type || (product as any).itemType) && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-blue-600" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Type</h3>
                </div>
                <p className="text-lg font-black text-slate-900">{product.type || (product as any).itemType}</p>
              </div>
            )}
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pricing */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Pricing</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Unit Price</span>
                  <span className="text-lg font-black text-slate-900">${product.unitPrice.toFixed(2)}</span>
                </div>
                {product.costPrice !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Cost Price</span>
                    <span className="text-lg font-black text-slate-900">${product.costPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tax Rate</span>
                  <span className="text-lg font-black text-slate-900">{product.taxRate}%</span>
                </div>
                {product.costPrice !== undefined && (
                  <div className="pt-3 border-t border-slate-300 flex justify-between">
                    <span className="text-xs font-bold text-emerald-600 uppercase">Markup</span>
                    <span className="text-lg font-black text-emerald-600">
                      {((product.unitPrice - product.costPrice) / product.costPrice * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            {(product.stockLevel !== undefined || product.reorderPoint !== undefined) && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Box size={20} className="text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Inventory</h3>
                </div>
                <div className="space-y-3">
                  {product.stockLevel !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase">Stock Level</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900">{product.stockLevel}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${stockStatusColor}`}>
                          {stockStatus}
                        </span>
                      </div>
                    </div>
                  )}
                  {product.reorderPoint !== undefined && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Reorder Point</span>
                      </div>
                      <span className="text-lg font-black text-slate-900">{product.reorderPoint}</span>
                    </div>
                  )}
                  {product.reorderQuantity !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase">Reorder Quantity</span>
                      <span className="text-lg font-black text-slate-900">{product.reorderQuantity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Specifications</h3>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.specifications}</p>
              </div>
            </div>
          )}

          {/* Physical Dimensions */}
          {(product.dimensions || product.weight) && (
            <div className="grid grid-cols-2 gap-6">
              {product.dimensions && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Ruler size={18} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Dimensions</h3>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                  </p>
                </div>
              )}
              {product.weight && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Weight size={18} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Weight</h3>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {product.weight.value} {product.weight.unit}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Supplier Info */}
          {(product.manufacturer || product.supplier || product.supplierSKU) && (
            <div className="grid grid-cols-3 gap-6">
              {product.manufacturer && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Factory size={18} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Manufacturer</h3>
                  </div>
                  <p className="text-sm font-black text-slate-900">{product.manufacturer}</p>
                </div>
              )}
              {product.supplier && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck size={18} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Supplier</h3>
                  </div>
                  <p className="text-sm font-black text-slate-900">{product.supplier}</p>
                </div>
              )}
              {product.supplierSKU && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Barcode size={18} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Supplier SKU</h3>
                  </div>
                  <p className="text-sm font-black text-slate-900">{product.supplierSKU}</p>
                </div>
              )}
            </div>
          )}

          {/* Warranty */}
          {(product.warrantyMonths || product.warrantyDetails) && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Warranty</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-3">
                {product.warrantyMonths && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">
                      {product.warrantyMonths} months warranty
                    </span>
                  </div>
                )}
                {product.warrantyDetails && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{product.warrantyDetails}</p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {product.images && product.images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Product Images</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <div key={index} className="aspect-square bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Composer Modal */}
      <ProductComposer
        isOpen={showProductComposer}
        onClose={() => setShowProductComposer(false)}
        initialData={product}
        mode="edit"
      />
    </div>
  );
};

export default ProductDetail;
