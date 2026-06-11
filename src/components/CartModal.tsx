import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ShoppingBag, ShieldCheck, Truck, CreditCard, Sparkles, Building, UserCheck } from 'lucide-react';
import { CartItem, BusinessAccount } from '../types';
import { getProductMOQ } from '../lib/moq';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  businessAccount: BusinessAccount | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: () => void;
  onOpenRegister: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  businessAccount,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  onOpenRegister
}: CartModalProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.product.price ?? 0) * item.quantity), 0);
  const estimatedShipping = subtotal > 1000 ? 0 : 45.00; // Free wholesale shipping for orders over $1,000
  const taxRate = 0.08; // 8% distributor tier tax
  const estimatedTax = subtotal * taxRate;
  const total = subtotal + estimatedShipping + estimatedTax;

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isWithinLimits = totalQuantity >= 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full bg-neutral-950 border-l border-neutral-900 text-neutral-100 flex flex-col justify-between shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-900/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#62cdd9]/10 rounded-lg text-[#62cdd9]">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider font-sans uppercase text-white">Wholesale Order</h3>
                <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{cartItems.length} curations selected</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white p-1 rounded-full hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            
            {businessAccount ? (
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-900/80 flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={14} />
                </div>
                <div className="text-left font-sans">
                  <span className="block text-[8px] text-emerald-400 font-mono tracking-widest font-bold leading-none uppercase">
                    COMMERCIAL TAX-EXTINCT ACTIVE
                  </span>
                  <span className="block text-xs font-medium text-white leading-tight mt-0.5 max-w-[280px] truncate">
                    {businessAccount.businessName} • {businessAccount.address}
                  </span>
                </div>
              </div>
            ) : (
            <div className="p-4 bg-[#62cdd9]/5 rounded-xl border border-[#62cdd9]/10 flex items-start gap-3">
                <Building size={16} className="text-[#62cdd9] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-semibold text-[#62cdd9] font-sans tracking-wide">BUSINESS ACCOUNT MANDATORY</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed font-light mt-1">
                    An active tobacco distributor status is required before executing wholesale logistics.
                  </p>
                </div>
              </div>
            )}

            {cartItems.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-14 w-14 rounded-full border border-neutral-900/80 bg-neutral-950/50 flex items-center justify-center text-neutral-600">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-light text-neutral-400 font-sans tracking-wide">Order is currently unallocated</h4>
                  <p className="text-[10px] text-neutral-600 font-mono tracking-wider uppercase mt-1">Browse catalogs to allocate stock</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-neutral-900">
                {cartItems.map((item, index) => {
                  const moq = getProductMOQ(item.product);
                  return (
                    <div key={item.product.id} className={`flex items-center gap-4 ${index > 0 ? 'pt-4' : ''}`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-14 w-14 rounded-lg object-cover border border-neutral-900 bg-neutral-950"
                      />

                      <div className="flex-grow font-sans">
                        <div className="flex justify-between items-start">
                          <span className="block text-[9px] text-neutral-500 tracking-wider font-mono uppercase">{item.product.brand}</span>
                          <span className="text-[8px] text-[#62cdd9] font-mono bg-[#62cdd9]/10 border border-[#62cdd9]/10 px-1.5 py-0.5 rounded leading-none uppercase font-bold">
                            MOQ: {moq}
                          </span>
                        </div>
                        <h4 className="text-xs text-white font-medium line-clamp-1">{item.product.name}</h4>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          {/* Quantity picker */}
                          <div className="flex items-center border border-neutral-900 rounded bg-neutral-950 overflow-hidden focus-within:border-[#62cdd9]/40 transition-colors">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, Math.max(moq, item.quantity - 1))}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors select-none"
                              title={`Minimum allocation is ${moq}`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity || ''}
                              min={moq}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val)) {
                                  onUpdateQuantity(item.product.id, val);
                                } else {
                                  onUpdateQuantity(item.product.id, 0);
                                }
                              }}
                              onBlur={() => {
                                if (item.quantity < moq || isNaN(item.quantity)) {
                                  onUpdateQuantity(item.product.id, moq);
                                }
                              }}
                              className="w-10 text-center bg-transparent text-[11px] font-mono text-white focus:outline-none focus:ring-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-0.5"
                            />
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity < moq ? moq + 1 : item.quantity + 1)}
                              className="px-2 py-0.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors select-none"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-mono text-neutral-300">
                            {item.product.price !== undefined ? `$${(item.product.price * item.quantity).toFixed(2)}` : 'Price TBD'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-neutral-600 hover:text-red-400 rounded-full hover:bg-neutral-900/60 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Checkout Totals Summary & Submit */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-neutral-900/20 border-t border-neutral-900 space-y-4">
              <div className="space-y-2 font-mono text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>WHOLESALE COST</span>
                  <span className="text-neutral-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck size={12} className="text-neutral-500" />
                    <span>LTL DISPATCH FREIGHT</span>
                  </span>
                  <span className="text-neutral-200">
                    {estimatedShipping === 0 ? <span className="text-emerald-400 font-semibold text-[10px] tracking-wider uppercase">FREE FREIGHT (VAL &gt; $1000)</span> : `$${estimatedShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DISTRIBUTOR STATE TAX (8%)</span>
                  <span className="text-neutral-200">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-white font-semibold border-t border-neutral-900 pt-3">
                  <span>TOTAL ESTIMATED ORDER</span>
                  <span className="text-[#62cdd9]">${total.toFixed(2)}</span>
                </div>
              </div>

              {businessAccount ? (
                isWithinLimits ? (
                  <button
                    type="button"
                    onClick={onPlaceOrder}
                    className="w-full bg-[#62cdd9] text-neutral-950 hover:bg-[#62cdd9]/80 font-sans tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>TRANSMIT WHOLESALE ORDER</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      disabled
                      className="w-full bg-neutral-900 text-red-400 font-sans tracking-widest uppercase text-xs font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-red-500/20"
                    >
                      <span>ORDER LIMIT CONSTRAINTS</span>
                    </button>
                    <div className="p-3.5 bg-red-500/5 rounded-xl border border-red-500/10 text-center space-y-1.5">
                      <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider">
                        MINIMUM ALLOCATION: 100 UNITS REQUIRED
                      </p>
                      <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                        Your current consignment total is {totalQuantity} units. Please add at least {100 - totalQuantity} more items to satisfy first-stage wholesale shipping requirements.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRegister();
                    }}
                    className="w-full bg-[#62cdd9] text-neutral-950 hover:bg-[#62cdd9]/80 font-sans tracking-widest uppercase text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <UserCheck size={14} />
                    <span>CREATE BUSINESS ACCOUNT</span>
                  </button>
                  <p className="text-[10px] text-[#62cdd9] font-mono uppercase tracking-wider text-center">
                    Verification Account Required to Order
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed text-center">
                    Click above to quickly verify with your official business Name, Email, and physical shipping Address.
                  </p>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
