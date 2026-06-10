import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Package, ShoppingBag, Truck, SlidersHorizontal, 
  Trash2, CreditCard, Sparkles, User, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, AlertCircle, PlusCircle, CheckCircle2,
  TrendingUp, CircleDot, Layers, Database, Building, Edit, Edit2, 
  Plus, Search, X, Check, Loader2, Save, FileText, LayoutGrid, Award
} from 'lucide-react';
import { Order, Product } from '../types';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  onSimulateOrder: (order: Order) => void;
  onClose: () => void;
  products: Product[];
  onRefreshProducts: () => void;
}

export default function AdminDashboard({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSimulateOrder,
  onClose,
  products,
  onRefreshProducts
}: AdminDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Orders Tab State
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Products Tab State
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('All');
  
  // Product Form/Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormSaving, setIsFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionDoneMsg, setActionDoneMsg] = useState('');

  // Product Form Field States
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('Vaporizers');
  const [formPrice, setFormPrice] = useState<number | undefined>(undefined);
  const [formSuggestedMSRP, setFormSuggestedMSRP] = useState<number | undefined>(undefined);
  const [formImage, setFormImage] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMaterial, setFormMaterial] = useState('');
  const [formDimensions, setFormDimensions] = useState('');
  const [formOrigin, setFormOrigin] = useState('Imported');
  const [formCapacity, setFormCapacity] = useState('');
  const [formInStock, setFormInStock] = useState(true);
  const [formFeatures, setFormFeatures] = useState('');

  // Pre-configured mock buyers for simulated intakes
  const MOCK_BUYERS = [
    { businessName: "Apex Lounge Distributors", email: "procure@apexlounge.co", address: "128 Luxury Wharf, Miami, FL", phone: "+1 (305) 555-0104", licenseNumber: "EIN-88402-FL" },
    { businessName: "The Vintage humidor LLC", email: "manager@vintagehumidor.com", address: "402 Spanish Cedar Way, Dallas, TX", phone: "+1 (214) 555-8930", licenseNumber: "EIN-33921-TX" },
    { businessName: "Breathe Boutique Labs", email: "wholesale@breatheboutique.io", address: "889 Quartz Street, Portland, OR", phone: "+1 (503) 555-3344", licenseNumber: "EIN-20412-OR" },
    { businessName: "Ethereal Smoke Ltd.", email: "info@etherealsmoke.ca", address: "12 Marine Vista, West Vancouver, BC", phone: "+1 (604) 555-7711", licenseNumber: "EIN-77402-BC" }
  ];

  // Helper to handle random order simulation
  const handleIntakeSimulation = () => {
    const randomBuyer = MOCK_BUYERS[Math.floor(Math.random() * MOCK_BUYERS.length)];
    
    // Grab 1 or 2 random products from dynamic list (falling back to generic products if empty)
    const activeProductsList = products.length > 0 ? products : [];
    if (activeProductsList.length === 0) {
      alert("No products found in the catalogue to simulate an order. Please register a product first.");
      return;
    }

    const shuffledProducts = [...activeProductsList].sort(() => 0.5 - Math.random());
    const item1 = shuffledProducts[0];
    const item2 = shuffledProducts[1] || shuffledProducts[0];

    // Determine quantities for wholesale validation
    const q1 = Math.floor(Math.random() * 40) + 60; // 60 to 99 units 
    const q2 = Math.floor(Math.random() * 40) + 50; // 50 to 89 units
    
    const cartItems = item1.id === item2.id 
      ? [{ product: item1, quantity: q1 }]
      : [{ product: item1, quantity: q1 }, { product: item2, quantity: q2 }];

    const subtotal = cartItems.reduce((acc, item) => acc + ((item.product.price ?? 0) * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 45.00;
    const tax = subtotal * 0.08;
    const finalTotal = subtotal + shipping + tax;

    const fakeOrder: Order = {
      id: `PAC-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cartItems,
      total: finalTotal,
      businessAccount: {
        ...randomBuyer,
        isVerified: true,
        registeredAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      },
      status: Math.random() > 0.5 ? 'Pending Verification' : 'Processing',
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: `LTL-FREIGHT-${Math.floor(50000 + Math.random() * 50000)}`
    };

    onSimulateOrder(fakeOrder);
  };

  // Compute telemetries
  const grossVolume = orders.reduce((sum, ord) => sum + ord.total, 0);
  const pendingCount = orders.filter(ord => ord.status === 'Pending Verification').length;
  const processingCount = orders.filter(ord => ord.status === 'Processing').length;
  const shippedCount = orders.filter(ord => ord.status === 'Shipped').length;
  const totalItemUnits = orders.reduce((sum, ord) => sum + ord.items.reduce((acc, item) => acc + item.quantity, 0), 0);

  // Filter orders
  const filteredOrders = orders.filter(ord => {
    const matchesStatus = filterStatus === 'All' || ord.status === filterStatus;
    const matchesSearch = ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.businessAccount.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ord.businessAccount.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter products for inventory manager
  const filteredProducts = products.filter(p => {
    const matchesCategory = inventoryCategory === 'All' || p.category === inventoryCategory;
    const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.brand.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Product CRUD functions
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormId(`PAC-PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormBrand('');
    setFormCategory('Vaporizers');
    setFormPrice(undefined);
    setFormSuggestedMSRP(undefined);
    setFormImage('');
    setFormDescription('');
    setFormMaterial('');
    setFormDimensions('');
    setFormOrigin('');
    setFormCapacity('');
    setFormInStock(true);
    setFormFeatures('');
    setFormError('');
    setActionDoneMsg('');
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormSuggestedMSRP(product.suggestedMSRP);
    setFormImage(product.image);
    setFormDescription(product.description || '');
    setFormMaterial(product.specs?.material || '');
    setFormDimensions(product.specs?.dimensions || '');
    setFormOrigin(product.specs?.origin || 'Imported');
    setFormCapacity(product.specs?.capacity || '');
    setFormInStock(product.specs?.inStock ?? true);
    setFormFeatures(product.features ? product.features.join(', ') : '');
    setFormError('');
    setActionDoneMsg('');
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formName || !formBrand) {
      setFormError('Please supply all required fields (ID, Brand, Title).');
      return;
    }

    setIsFormSaving(true);
    setFormError('');
    setActionDoneMsg('');

    const parsedProduct: Product = {
      id: formId,
      name: formName,
      brand: formBrand,
      category: formCategory,
      price: formPrice !== undefined ? Number(formPrice) : undefined,
      suggestedMSRP: formSuggestedMSRP !== undefined ? Number(formSuggestedMSRP) : formPrice !== undefined ? Number(formPrice) * 2 : undefined,
      image: formImage || '/src/assets/images/luxury_smoke_banner_1780813987485.png',
      description: formDescription,
      rating: editingProduct ? editingProduct.rating : 4.8,
      specs: {
        material: formMaterial || 'Alloy Block',
        dimensions: formDimensions || 'Standard',
        origin: formOrigin,
        capacity: formCapacity,
        inStock: formInStock
      },
      features: formFeatures ? formFeatures.split(',').map(f => f.trim()).filter(Boolean) : []
    };

    try {
      const endpoint = editingProduct ? `/api/products/${formId}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedProduct)
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.error || 'Failed to sync product registry update.');
      }

      setActionDoneMsg(editingProduct ? 'Product specifications updated successfully!' : 'Wholesale product added successfully!');
      
      onRefreshProducts();
      
      setTimeout(() => {
        setIsProductModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Operation stalled due to backend network interruption.');
    } finally {
      setIsFormSaving(false);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm('Are you absolutely certain you want to decommission and delete this wholesale product from the database ledger?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errObj = await response.json().catch(() => ({}));
        throw new Error(errObj.error || 'Failed to remove target item registry.');
      }

      onRefreshProducts();
    } catch (err: any) {
      alert(`Deletion stalled: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 py-4 font-sans selection:bg-neutral-800">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
        <div>
          <span className="text-[10px] tracking-[0.4em] font-mono text-amber-500 uppercase flex items-center gap-1.5 mb-1">
            <Database size={12} className="animate-pulse" /> CENTRALIZED WAREHOUSE SYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Distributor <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">Corporate Terminal</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 max-w-xl">
            Authorize state tax exemptions, manage luxury wholesale inventories in MongoDB Atlas, audit incoming tobacco license EIN keys, and dispatch LTL logistics.
          </p>
        </div>

        {/* Dynamic Header Actions */}
        <div className="flex items-center gap-3">
          {activeTab === 'orders' ? (
            <button
              type="button"
              onClick={handleIntakeSimulation}
              className="bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              title="Simulate random commercial buyers ordering products"
            >
              <PlusCircle size={14} className="text-amber-500" />
              <span>Simulate Order Intake</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateModal}
              className="bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] font-bold shadow-lg shadow-amber-500/10"
              title="Register a brand new wholesale product item"
            >
              <Plus size={14} className="text-neutral-950 stroke-[3]" />
              <span>Add Wholesale Product</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-400 rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-850 transition-all"
          >
            <span>Exit Control Room</span>
          </button>
        </div>
      </div>

      {/* Luxury Navigation Tabs */}
      <div className="flex border-b border-neutral-900 gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-1 text-xs font-mono tracking-widest uppercase font-semibold flex items-center gap-2 relative transition-all cursor-pointer ${
            activeTab === 'orders' ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Wholesale Orders Desk</span>
          {activeTab === 'orders' && (
            <motion.div layoutId="adminActiveTabBar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-1 text-xs font-mono tracking-widest uppercase font-semibold flex items-center gap-2 relative transition-all cursor-pointer ${
            activeTab === 'products' ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <Package size={14} />
          <span>Product Inventory Manager</span>
          {activeTab === 'products' && (
            <motion.div layoutId="adminActiveTabBar" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* ORDERS TAB PANEL */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Telemetry Dashboard Bento row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Gross Wholesale Value</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <span className="block text-2xl font-mono font-semibold text-white tracking-tight">${grossVolume.toFixed(2)}</span>
                <span className="block text-[9px] font-mono text-emerald-400 uppercase tracking-widest mt-1">100% SECURE COMMERCE</span>
              </div>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Total Items Dispatched</span>
                <Package size={16} className="text-amber-400" />
              </div>
              <div>
                <span className="block text-2xl font-mono font-semibold text-white tracking-tight">{totalItemUnits} Units</span>
                <span className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1">Across {orders.length} active bills</span>
              </div>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Pending Registry</span>
                <CircleDot size={16} className="text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="block text-2xl font-mono font-semibold text-amber-500 tracking-tight">{pendingCount} Audits</span>
                <span className="block text-[9px] font-mono text-amber-400/80 uppercase tracking-widest mt-1">LICENSE VERIFICATIONS PENDING</span>
              </div>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">LTL Freight Shipped</span>
                <Truck size={16} className="text-emerald-400" />
              </div>
              <div>
                <span className="block text-2xl font-mono font-semibold text-emerald-400 tracking-tight">{shippedCount} Carriages</span>
                <span className="block text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest mt-1">LOGISTICS DISPATCH SUCCESS</span>
              </div>
            </div>
          </div>

          {/* Filters controls and query inputs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-neutral-900">
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Pending Verification', 'Processing', 'Shipped'].map((status) => {
                const count = status === 'All' 
                  ? orders.length 
                  : orders.filter(ord => ord.status === status).length;

                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wide transition-all cursor-pointer select-none flex items-center gap-2 ${
                      filterStatus === status
                        ? 'bg-amber-500 text-neutral-950 font-semibold'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    <span>{status.toUpperCase()}</span>
                    <span className={`text-[9px] px-1 rounded-full ${filterStatus === status ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-950 text-neutral-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Query Registry ID, Business Name..."
                className="w-full bg-neutral-900 border border-neutral-850 rounded-lg pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-neutral-500 font-mono"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <SlidersHorizontal size={13} />
              </div>
            </div>
          </div>

          {/* Orders Desk List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 border border-neutral-900 border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-500">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h5 className="text-xs text-neutral-400 font-mono uppercase tracking-wider">No corresponding records detected</h5>
                  <p className="text-xs text-neutral-500 font-light mt-1">Generate a simulated order or change database filters above to inspect orders.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <div 
                      key={order.id} 
                      className={`bg-neutral-900/20 border border-neutral-900 rounded-2xl overflow-hidden transition-all duration-300 hover:border-neutral-800 ${isExpanded ? 'ring-1 ring-amber-500/10' : ''}`}
                    >
                      {/* Collapsible Header */}
                      <div 
                        onClick={() => toggleExpand(order.id)}
                        className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-xl text-amber-500 flex-shrink-0">
                            <ShoppingBag size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-white tracking-widest">{order.id}</span>
                              <span className="text-[9px] font-mono text-neutral-500 font-medium">{order.orderDate}</span>
                            </div>
                            <span className="text-xs text-neutral-400 font-medium block mt-1">{order.businessAccount.businessName}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:text-right text-left font-mono">
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-widest block">Cargo Units</span>
                            <span className="text-xs text-neutral-300 font-medium mt-0.5 block">
                              {order.items.reduce((acc, i) => acc + i.quantity, 0)} Units
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-neutral-500 uppercase tracking-widest block">Sub-Total</span>
                            <span className="text-xs text-amber-500 font-bold block mt-0.5">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center">
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-semibold ${
                              order.status === 'Shipped' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : order.status === 'Processing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                order.status === 'Shipped' 
                                  ? 'bg-emerald-400' 
                                  : order.status === 'Processing'
                                  ? 'bg-blue-400 animate-pulse'
                                  : 'bg-amber-400 animate-pulse'
                              }`} />
                              <span>{order.status}</span>
                            </span>
                          </div>

                          <div className="text-neutral-500">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-neutral-900 bg-neutral-950/40"
                          >
                            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h5 className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase border-b border-neutral-900 pb-2 flex items-center gap-1.5">
                                  <User size={12} className="text-amber-500" />
                                  <span>OFFICIAL CONSIGNEE BIO</span>
                                </h5>

                                <div className="text-xs space-y-2.5 font-light">
                                  <p className="flex items-start gap-2">
                                    <Building size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-neutral-300">
                                      <strong className="font-semibold block">{order.businessAccount.businessName}</strong>
                                      <span className="text-[10px] text-neutral-500 font-mono">License Stamp: {order.businessAccount.licenseNumber}</span>
                                    </span>
                                  </p>
                                  
                                  <p className="flex items-center gap-2">
                                    <Mail size={14} className="text-neutral-500 flex-shrink-0" />
                                    <span className="text-neutral-300 font-mono text-[11px] truncate">{order.businessAccount.email}</span>
                                  </p>

                                  <p className="flex items-center gap-2">
                                    <Phone size={14} className="text-neutral-500 flex-shrink-0" />
                                    <span className="text-neutral-300 font-mono text-[11px]">{order.businessAccount.phone}</span>
                                  </p>

                                  <p className="flex items-start gap-2">
                                    <MapPin size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-neutral-400 text-[11px] leading-relaxed">{order.businessAccount.address}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase border-b border-neutral-900 pb-2 flex items-center gap-1.5">
                                  <Layers size={12} className="text-amber-500" />
                                  <span>CONSIGNMENT MANIFEST</span>
                                </h5>

                                <div className="space-y-3">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-3 text-xs">
                                      <img 
                                        src={item.product.image} 
                                        alt={item.product.name}
                                        referrerPolicy="no-referrer"
                                        className="h-10 w-10 rounded-lg object-cover bg-neutral-950 border border-neutral-900 flex-shrink-0"
                                      />
                                      <div className="flex-grow font-sans min-w-0">
                                        <span className="block text-[8px] font-mono text-neutral-500 uppercase">{item.product.brand}</span>
                                        <span className="block text-white font-medium truncate">{item.product.name}</span>
                                        <span className="block text-[10px] font-mono text-neutral-400 mt-0.5">
                                          {item.quantity} units x {item.product.price !== undefined ? `$${item.product.price.toFixed(2)}` : 'Price TBD'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4 bg-neutral-950/80 p-4 rounded-xl border border-neutral-900/60">
                                <h5 className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase border-b border-neutral-900 pb-2 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <Truck size={12} className="text-amber-500" />
                                    <span>FREIGHT DISPATCH DESK</span>
                                  </span>
                                  <span className="text-[10px] text-amber-400 font-mono uppercase">{order.trackingNumber.split('-')[2]}</span>
                                </h5>

                                <div className="space-y-2.5">
                                  <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider">STATE ROUTING STATUS:</span>
                                  
                                  <div className="grid grid-cols-1 gap-2">
                                    <button
                                      onClick={() => onUpdateOrderStatus(order.id, 'Pending Verification')}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer border ${
                                        order.status === 'Pending Verification'
                                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold'
                                          : 'bg-neutral-900 text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-850'
                                      }`}
                                    >
                                      <span>1. AUDIT REGISTRY</span>
                                      {order.status === 'Pending Verification' && <CheckCircle2 size={12} className="text-amber-500" />}
                                    </button>

                                    <button
                                      onClick={() => onUpdateOrderStatus(order.id, 'Processing')}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer border ${
                                        order.status === 'Processing'
                                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-semibold'
                                          : 'bg-neutral-900 text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-850'
                                      }`}
                                    >
                                      <span>2. PACK LOGISTICS</span>
                                      {order.status === 'Processing' && <CheckCircle2 size={12} className="text-blue-400" />}
                                    </button>

                                    <button
                                      onClick={() => onUpdateOrderStatus(order.id, 'Shipped')}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer border ${
                                        order.status === 'Shipped'
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold'
                                          : 'bg-neutral-900 text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-850'
                                      }`}
                                    >
                                      <span>3. SHIP LTL CARGO</span>
                                      {order.status === 'Shipped' && <CheckCircle2 size={12} className="text-emerald-400" />}
                                    </button>
                                  </div>

                                  <div className="pt-3 border-t border-neutral-900 flex justify-between items-center text-[10px]">
                                    <span className="text-neutral-500 font-mono uppercase">SECURITY VOIDS:</span>
                                    <button
                                      onClick={() => onDeleteOrder(order.id)}
                                      className="text-red-500 hover:text-red-400 hover:bg-red-505/10 rounded-lg p-1.5 flex items-center gap-1 font-mono transition-all cursor-pointer"
                                      title="Void corporate order from active registries"
                                    >
                                      <Trash2 size={13} />
                                      <span>Void Manifest</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS / INVENTORY MANAGER TAB PANEL */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls filtering block */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Vessels', 'Vaporizers', 'Cigar Accessories', 'Artisanal Pipes', 'Curated Sets', 'Disposables', 'Pod Systems', 'E-Liquid', 'Hardware'].map((cat) => {
                const count = cat === 'All'
                  ? products.length
                  : products.filter(p => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wide transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                      inventoryCategory === cat
                        ? 'bg-amber-500 text-neutral-950 font-semibold text-neut'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    <span>{cat.toUpperCase()}</span>
                    <span className={`text-[8px] px-1 rounded-full ${inventoryCategory === cat ? 'bg-neutral-950 text-amber-400 font-bold' : 'bg-neutral-950 text-neutral-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search catalog ID, brand, name..."
                className="w-full bg-neutral-900 border border-neutral-850 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Search size={13} />
              </div>
            </div>
          </div>

          {/* Product Inventory Dense Table */}
          <div className="overflow-x-auto border border-neutral-900 rounded-2xl bg-neutral-950/20">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-neutral-900 text-[10px] font-mono tracking-widest text-neutral-500 uppercase bg-neutral-900/15">
                  <th className="py-4 px-5">Catalog ID</th>
                  <th className="py-4 px-5">Commercial Product</th>
                  <th className="py-4 px-5">Wholesale Class</th>
                  <th className="py-4 px-5">Wholesale Code</th>
                  <th className="py-4 px-5">Suggested MSRP</th>
                  <th className="py-4 px-5">Stock Control</th>
                  <th className="py-4 px-5 text-right">Actions Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-900/10 transition-colors text-xs text-neutral-300">
                    {/* Catalog ID */}
                    <td className="py-4 px-5 font-mono font-medium tracking-wider text-[11px] text-neutral-450 select-all">
                      {product.id}
                    </td>

                    {/* Product Particulars info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover bg-neutral-950 border border-neutral-850 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                        <div className="min-w-0">
                          <span className="block text-[8px] font-mono text-neutral-500 uppercase leading-none mb-1">{product.brand}</span>
                          <span className="block text-white font-medium truncate max-w-xs">{product.name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category Label */}
                    <td className="py-4 px-5">
                      <span className="px-2 py-0.5 rounded bg-neutral-900 font-mono text-[9px] tracking-wider text-neutral-400 uppercase border border-neutral-850/50">
                        {product.category}
                      </span>
                    </td>

                    {/* Wholesale/Dealer Cost */}
                    <td className="py-4 px-5 font-mono font-bold text-amber-500">
                      ${Number(product.price).toFixed(2)}
                    </td>

                    {/* Suggested MSRP */}
                    <td className="py-4 px-5 font-mono text-neutral-400">
                      ${Number(product.suggestedMSRP).toFixed(2)}
                    </td>

                    {/* Current Stock state */}
                    <td className="py-4 px-5 font-mono">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider ${
                        product.specs?.inStock
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          : 'bg-red-500/10 text-red-400 border border-red-500/15'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${product.specs?.inStock ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <span>{product.specs?.inStock ? 'In Stock' : 'Out-of-Stock'}</span>
                      </span>
                    </td>

                    {/* Actions tools */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(product)}
                          className="p-2 hover:bg-amber-500/10 hover:text-amber-400 rounded-lg text-neutral-500 transition-all cursor-pointer border border-transparent hover:border-amber-500/10"
                          title="Edit product parameters"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProductDelete(product.id)}
                          className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-neutral-500 transition-all cursor-pointer border border-transparent hover:border-red-500/10"
                          title="Decommission product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty listings block */}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-20 border-dashed border-t border-neutral-900">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-500">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs text-neutral-400 font-mono uppercase tracking-wider">No matching inventory found</h5>
                          <p className="text-xs text-neutral-500 mt-1">Try expanding search query keywords to display more stock items.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Creation & Editing Overlay Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-neutral-900/95 border border-neutral-850 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col z-10"
            >
              {/* Premium Accent Line */}
              <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-200 to-amber-500" />

              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-850 flex items-center justify-between">
                <div>
                  <span className="text-[9px] tracking-widest font-mono text-amber-500 uppercase block">
                    {editingProduct ? 'SPECIFICATION REVISION PROTOCOL' : 'NEW WHOLESALE CATALOGUE REGISTRY'}
                  </span>
                  <h3 className="text-lg font-light text-white tracking-tight mt-1">
                    {editingProduct ? 'Modify Product Specifications' : 'Add Wholesale Product'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-2 text-neutral-450 hover:text-white hover:bg-neutral-850 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content Form */}
              <form onSubmit={handleProductSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
                
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-center gap-2.5">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {actionDoneMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="flex-shrink-0" />
                    <span>{actionDoneMsg}</span>
                  </div>
                )}

                {/* Section 1: Core Particulars */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <Award size={11} className="text-amber-500" />
                    <span>1. CORE WHOLESALE DESCRIPTION</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Product Catalogue ID <span className="text-amber-500">*</span></label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProduct}
                        value={formId}
                        onChange={(e) => setFormId(e.target.value)}
                        placeholder="e.g., PAC-PROD-901"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Wholesale Brand / MASTER <span className="text-amber-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="e.g., SMOK, PAX, SUTRA"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Product Title / Name <span className="text-amber-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g., Sutra Vaporizer System v2"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Category <span className="text-amber-500">*</span></label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      >
                        {['Vessels', 'Vaporizers', 'Cigar Accessories', 'Artisanal Pipes', 'Curated Sets', 'Disposables', 'E-Liquid & Pod', 'Pouches', 'Pod Systems', 'E-Liquid', 'Hardware'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Media and brief */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <FileText size={11} className="text-amber-500" />
                    <span>2. MEDIA & SPEC BRIEF</span>
                  </h4>

                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Product Image Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setFormImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-neutral-200 file:bg-amber-500 file:text-neutral-950 file:px-3 file:py-2 file:rounded-lg file:border-none file:font-semibold bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                    />
                    {formImage && (
                      <img
                        src={formImage}
                        alt="Product preview"
                        className="mt-3 h-24 w-24 object-cover rounded-lg border border-neutral-850"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Short Commercial Synopsis</label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      placeholder="Enter a brief commercial overview outlining premium feature highlight parameters."
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10 resize-none animate-none"
                    />
                  </div>
                </div>

                {/* Section 3: Commercial pricing & stock */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <CreditCard size={11} className="text-amber-500" />
                    <span>3. COMMERCIAL PRICING & STOCK STATUS</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Wholesale Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formPrice ?? ''}
                        onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Suggested MSRP ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formSuggestedMSRP}
                        onChange={(e) => setFormSuggestedMSRP(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 font-mono text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Warehouse Stocking</label>
                      <div className="flex items-center gap-3 h-[42px] bg-neutral-950 rounded-lg px-3.5 border border-neutral-850">
                        <input
                          type="checkbox"
                          id="formInStock"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="h-4 w-4 bg-neutral-900 border-neutral-800 rounded text-amber-550 focus:ring-amber-500 focus:ring-offset-neutral-950"
                        />
                        <label htmlFor="formInStock" className="text-xs text-neutral-300 font-medium cursor-pointer font-mono">
                          {formInStock ? 'IN STOCK' : 'OUT-OF-STOCK'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Specifications detail */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <LayoutGrid size={11} className="text-amber-500" />
                    <span>4. MATERIAL SPECIFICATIONS & ENGINEERING</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Chassis Material Type</label>
                      <input
                        type="text"
                        value={formMaterial}
                        onChange={(e) => setFormMaterial(e.target.value)}
                        placeholder="e.g., Premium Titanium Alloy, Borosilicate Quartz"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Module Dimensions</label>
                      <input
                        type="text"
                        value={formDimensions}
                        onChange={(e) => setFormDimensions(e.target.value)}
                        placeholder="e.g., 140mm x 35mm x 35mm"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Regional/Corporate Origin</label>
                      <input
                        type="text"
                        value={formOrigin}
                        onChange={(e) => setFormOrigin(e.target.value)}
                        placeholder="e.g., Designed in USA / Crafted in Toronto"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Chamber Capacity / Cell rating</label>
                      <input
                        type="text"
                        value={formCapacity}
                        onChange={(e) => setFormCapacity(e.target.value)}
                        placeholder="e.g., 2.5 mL / 1200 mAh"
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Consignment Features (Comma-separated)</label>
                    <input
                      type="text"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="e.g., Precision airflow, Haptic feedback, Magnet cap"
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/10"
                    />
                  </div>
                </div>

                {/* Submit footer control block */}
                <div className="pt-6 border-t border-neutral-850 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-800 text-neutral-400 hover:text-white rounded-lg text-xs font-mono tracking-wider uppercase cursor-pointer hover:bg-neutral-850 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isFormSaving}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-semibold rounded-lg text-xs font-mono tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    {isFormSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-neutral-950" />
                        <span>Transmitting terms...</span>
                      </>
                    ) : (
                      <>
                        <Save size={13} />
                        <span>{editingProduct ? 'Commit Changes' : 'Publish Product'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
