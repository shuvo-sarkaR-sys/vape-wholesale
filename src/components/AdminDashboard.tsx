import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Package, ShoppingBag, Truck, SlidersHorizontal, 
  Trash2, CreditCard, Sparkles, User, Mail, Phone, MapPin, 
  ChevronDown, ChevronUp, AlertCircle, PlusCircle, CheckCircle2,
  TrendingUp, CircleDot, Layers, Database, Building
} from 'lucide-react';
import { Order, Product } from '../types';
import { PRODUCTS } from '../data/products';

interface AdminDashboardProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onDeleteOrder: (id: string) => void;
  onSimulateOrder: (order: Order) => void;
  onClose: () => void;
}

export default function AdminDashboard({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSimulateOrder,
  onClose
}: AdminDashboardProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    
    // Grab 1 or 2 random products
    const shuffledProducts = [...PRODUCTS].sort(() => 0.5 - Math.random());
    const item1 = shuffledProducts[0];
    const item2 = shuffledProducts[1];

    // Determine quantities that keep total units >= 100 for proper wholesale policies
    const q1 = Math.floor(Math.random() * 40) + 60; // 60 to 99 units of item 1
    const q2 = Math.floor(Math.random() * 40) + 50; // 50 to 89 units of item 2
    const cartItems = [
      { product: item1, quantity: q1 },
      { product: item2, quantity: q2 }
    ];

    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
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

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-10 py-4 font-sans selection:bg-neutral-800">
      
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
        <div>
          <span className="text-[10px] tracking-[0.4em] font-mono text-amber-500 uppercase flex items-center gap-1.5 mb-1">
            <Database size={12} className="animate-pulse" /> CENTRALIZED WAREHOUSE SYSTEM
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Distributor <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">B2B Order Terminal</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 max-w-xl">
            Authorize state tax exemptions, audit incoming tobacco license EIN keys, and dispatch heavy commercial LTL freight tracking logs.
          </p>
        </div>

        {/* Admin actions block */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleIntakeSimulation}
            className="bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            title="Simulate random commercial buyers ordering products"
          >
            <PlusCircle size={14} className="text-amber-500" />
            <span>Simulate Order Intake</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-850 hover:text-white text-neutral-400 rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-850 transition-all"
          >
            <span>Exit Control Room</span>
          </button>
        </div>
      </div>

      {/* Telemetry Dashboard Bento row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric Card 1: Gross Sales */}
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
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

        {/* Metric Card 2: Total Units */}
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
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

        {/* Metric Card 3: Pending verification */}
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
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

        {/* Metric Card 4: Dispatched Queue */}
        <div className="bg-neutral-900/30 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
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

      {/* Database control filters and query inputs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-neutral-900">
        
        {/* Status filtering row tabs */}
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

        {/* Database Quick Search */}
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

      {/* Orders List Desk */}
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
                    
                    {/* Unique Identifier & Merchant Label */}
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

                    {/* Stats summary of items & Pricing */}
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

                    {/* Current Dispatch Stage controller and action */}
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

                      <div className="text-neutral-500 group-hover:text-neutral-300">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                  </div>

                  {/* Expanded Body containing detailed client records and list breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-neutral-900 bg-neutral-950/40"
                      >
                        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* Col 1: Authorized Wholesaler Account details */}
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

                          {/* Col 2: Allocation Order Cargo manifest */}
                          <div className="space-y-4">
                            <h5 className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase border-b border-neutral-900 pb-2 flex items-center gap-1.5">
                              <Layers size={12} className="text-amber-500" />
                              <span>CARGO CONSIGNMENT MANIFEST</span>
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
                                      {item.quantity} x ${item.product.price.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Col 3: Safe Dispatch action controls */}
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
                                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-1.5 flex items-center gap-1 font-mono transition-all cursor-pointer"
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
  );
}
