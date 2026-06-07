import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, Mail, Phone, MapPin, FileText, Calendar, 
  ArrowLeft, Edit3, Save, CheckCircle2, Copy, Trash2,
  Package, DollarSign, Clock, Layers, ExternalLink, Sparkles
} from 'lucide-react';
import { BusinessAccount, Order } from '../types';

interface BuyerProfileProps {
  businessAccount: BusinessAccount;
  orders: Order[];
  onUpdateProfile: (updatedAccount: BusinessAccount) => void;
  onClose: () => void;
}

export default function BuyerProfile({
  businessAccount,
  orders,
  onUpdateProfile,
  onClose
}: BuyerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Edit states
  const [editName, setEditName] = useState(businessAccount.businessName);
  const [editEmail, setEditEmail] = useState(businessAccount.email);
  const [editAddress, setEditAddress] = useState(businessAccount.address);
  const [editPhone, setEditPhone] = useState(businessAccount.phone);
  const [editLicense, setEditLicense] = useState(businessAccount.licenseNumber);

  // Calculate stats
  const buyerOrders = orders.filter(ord => 
    ord.businessAccount.email.toLowerCase() === businessAccount.email.toLowerCase() ||
    ord.businessAccount.businessName.toLowerCase() === businessAccount.businessName.toLowerCase()
  );

  const totalSpent = buyerOrders.reduce((sum, ord) => sum + ord.total, 0);
  const totalItemsOrdered = buyerOrders.reduce((sum, ord) => 
    sum + ord.items.reduce((acc, item) => acc + item.quantity, 0), 0
  );
  
  const pendingOrdersCount = buyerOrders.filter(ord => ord.status === 'Pending Verification').length;
  const processingOrdersCount = buyerOrders.filter(ord => ord.status === 'Processing').length;
  const shippedOrdersCount = buyerOrders.filter(ord => ord.status === 'Shipped').length;

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOrderId(code);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updated: BusinessAccount = {
      ...businessAccount,
      businessName: editName.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
      phone: editPhone.trim(),
      licenseNumber: editLicense.trim()
    };

    onUpdateProfile(updated);
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <div className="space-y-10 py-4 font-sans selection:bg-neutral-800 text-neutral-100">
      
      {/* Toast Alert for successful save */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-neutral-950 px-6 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider font-bold"
          >
            <CheckCircle2 size={15} />
            <span>Buyer Credentials Synchronized Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-neutral-900 pb-8">
        <div>
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-xs font-mono tracking-wider text-amber-500 uppercase hover:text-amber-400 mb-3 cursor-pointer"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Catalog</span>
          </button>
          
          <span className="text-[10px] tracking-[0.4em] font-mono text-emerald-400 uppercase flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={11} /> VERIFIED B2B MERCHANT ARCHIVE
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Wholesale <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-200 to-amber-500">Buyer Workspace</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1 max-w-xl">
            Monitor consignment pipelines, track active commercial freight codes, and update your regulatory corporate profiles.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                // Cancel
                setIsEditing(false);
                // reset edit state
                setEditName(businessAccount.businessName);
                setEditEmail(businessAccount.email);
                setEditAddress(businessAccount.address);
                setEditPhone(businessAccount.phone);
                setEditLicense(businessAccount.licenseNumber);
              } else {
                setIsEditing(true);
              }
            }}
            className={`rounded-lg py-2.5 px-4 text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all border ${
              isEditing 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-transparent font-semibold shadow-md'
            }`}
          >
            <Edit3 size={13} />
            <span>{isEditing ? 'Cancel Modification' : 'Update Company Credentials'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Stats Visualizers & Bio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Bio Form Card */}
        <div className="lg:col-span-1 bg-neutral-900/20 border border-neutral-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />

          <h3 className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase mb-6 pb-2.5 border-b border-neutral-900 flex items-center gap-2">
            <Building size={14} className="text-amber-500" />
            <span>BUSINESS REGISTRY BIO</span>
          </h3>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="static-bio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Visual Company Identity */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Corporate Buyer</span>
                  <p className="text-xl font-semibold text-white mt-0.5 leading-snug">{businessAccount.businessName}</p>
                  <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    State verified merchant
                  </p>
                </div>

                {/* Listing of Fields */}
                <div className="space-y-4 font-sans text-xs">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500">Wholesale Email Contact</span>
                    <p className="text-neutral-200 font-mono flex items-center gap-2">
                      <Mail size={13} className="text-neutral-500 flex-shrink-0" />
                      <span>{businessAccount.email}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500">Corporate Dispatch Address</span>
                    <p className="text-neutral-200 flex items-start gap-2 leading-relaxed">
                      <MapPin size={13} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                      <span>{businessAccount.address}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500">Direct Telephone</span>
                    <p className="text-neutral-200 font-mono flex items-center gap-2">
                      <Phone size={13} className="text-neutral-500 flex-shrink-0" />
                      <span>{businessAccount.phone}</span>
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-neutral-900/60">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500">State Tobacco Stamp / EIN Key</span>
                    <p className="text-amber-400 font-mono text-[13px] font-semibold flex items-center gap-2 mt-0.5">
                      <FileText size={13} className="text-neutral-500" />
                      <span>{businessAccount.licenseNumber}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-500">Account Verified Since</span>
                    <p className="text-neutral-400 font-mono flex items-center gap-2">
                      <Calendar size={13} className="text-neutral-500" />
                      <span>{businessAccount.registeredAt || 'June 7, 2026'}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="edit-form"
                onSubmit={handleSaveProfile}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Editing Inputs */}
                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Official Business Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Owner / Purchasing Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Corporate Shipping Address</label>
                  <textarea
                    required
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Direct Telephone</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">State Tobacco Stamp EIN</label>
                  <input
                    type="text"
                    required
                    value={editLicense}
                    onChange={(e) => setEditLicense(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 py-2.5 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md hover:shadow-emerald-500/10 cursor-pointer transition-all"
                  >
                    <Save size={13} />
                    <span>Synchronize Credentials</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>

        {/* Right column: Stats Telemetry Cards & Order list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Internal Cargo Stats Bento Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center text-neutral-500 border-b border-neutral-950 pb-2 mb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest">W/S Capital Spent</span>
                <DollarSign size={13} className="text-amber-500" />
              </div>
              <div>
                <span className="text-xl font-mono font-bold text-white block">${totalSpent.toFixed(2)}</span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5 block">Across {buyerOrders.length} bookings</span>
              </div>
            </div>

            <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center text-neutral-500 border-b border-neutral-950 pb-2 mb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest">Total Cargo Imported</span>
                <Package size={13} className="text-amber-500" />
              </div>
              <div>
                <span className="text-xl font-mono font-bold text-white block">{totalItemsOrdered} Units</span>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-0.5 block">Wholesale allocations</span>
              </div>
            </div>

            <div className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between">
              <div className="flex justify-between items-center text-neutral-500 border-b border-neutral-950 pb-2 mb-3">
                <span className="text-[9px] font-mono uppercase tracking-widest">Dispatch Status</span>
                <Clock size={13} className="text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mt-0.5">
                  {shippedOrdersCount > 0 && (
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{shippedOrdersCount} SHIPPED</span>
                  )}
                  {processingOrdersCount > 0 && (
                    <span className="text-xs font-mono text-blue-400 font-semibold">{processingOrdersCount} PROCESSING</span>
                  )}
                  {pendingOrdersCount > 0 && (
                    <span className="text-xs font-mono text-amber-500 font-semibold">{pendingOrdersCount} REVIEWS</span>
                  )}
                  {buyerOrders.length === 0 && (
                    <span className="text-xs font-mono text-neutral-500 font-medium">NO ACTIVE LOGISTICS</span>
                  )}
                </div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider mt-1 block">Logistics dispatch logs</span>
              </div>
            </div>

          </div>

          {/* Consignment Ledger / Order lists for the particular Purchaser */}
          <div className="bg-neutral-900/10 border border-neutral-900 rounded-3xl p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h4 className="text-xs font-mono tracking-[0.25em] text-neutral-400 uppercase flex items-center gap-1.5">
                <Layers size={13} className="text-amber-500" />
                <span>DIRECT CONSIGNMENT RECORD LEDGER</span>
              </h4>
              <span className="text-[10px] font-mono text-neutral-500">{buyerOrders.length} bookings</span>
            </div>

            {buyerOrders.length === 0 ? (
              <div className="text-center py-16 border border-neutral-900 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3">
                <p className="text-xs text-neutral-500 font-mono uppercase tracking-wide">No booked commercial shipments</p>
                <p className="text-xs text-neutral-400 max-w-sm font-light mt-0.5 leading-relaxed">
                  Go back to the luxury catalogue, select at least 100 wholesale items, and press "Transmit Wholesale Order" to catalog your first consignment bill.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {buyerOrders.map((order) => (
                  <div key={order.id} className="bg-neutral-950/40 border border-neutral-900 rounded-xl p-5 space-y-4 hover:border-neutral-850 transition-all duration-300">
                    
                    {/* Invoice/Order Heading of this entry */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white tracking-widest">{order.id}</span>
                          <span className="text-[9px] text-neutral-500 font-mono font-medium">{order.orderDate}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono uppercase block mt-1">LTL FREIGHT CODE: {order.trackingNumber}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase font-semibold ${
                          order.status === 'Shipped' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : order.status === 'Processing'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${
                            order.status === 'Shipped' ? 'bg-emerald-400' : order.status === 'Processing' ? 'bg-blue-400 animate-pulse' : 'bg-amber-400 animate-pulse'
                          }`} />
                          <span>{order.status}</span>
                        </span>

                        <button 
                          onClick={() => handleCopyTracking(order.trackingNumber)}
                          className="text-[10px] font-mono text-neutral-500 hover:text-white border border-neutral-900 hover:border-neutral-800 bg-neutral-900/50 rounded px-2 py-1 flex items-center gap-1 cursor-pointer select-none"
                          title="Copy shipping tracking credentials to clipboard"
                        >
                          <Copy size={10} />
                          <span>{copiedOrderId === order.trackingNumber ? 'Copied' : 'Copy Tracking'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Consignment product visual layout */}
                    <div className="space-y-2.5">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 text-xs font-sans items-center justify-between">
                          <div className="flex gap-3 items-center min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-10 rounded-lg object-cover bg-neutral-950 border border-neutral-905 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="block text-[8px] font-mono text-amber-500/80 uppercase">{item.product.brand}</span>
                              <span className="text-neutral-200 tracking-tight block font-medium truncate">{item.product.name}</span>
                            </div>
                          </div>
                          
                          <div className="text-right font-mono flex-shrink-0">
                            <span className="text-neutral-400 text-[11px] block">{item.quantity} units</span>
                            <span className="text-neutral-500 font-medium text-[9px] block">${(item.product.price * item.quantity).toFixed(2)} sub</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer receipt info */}
                    <div className="flex justify-between items-center pt-3 border-t border-neutral-900/40 text-[11px] font-mono text-neutral-400">
                      <span>Consignment Volume: {order.items.reduce((s, i) => s + i.quantity, 0)} Units</span>
                      <span>Total Invoice: <strong className="text-amber-500 font-bold font-mono">${order.total.toFixed(2)}</strong></span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
