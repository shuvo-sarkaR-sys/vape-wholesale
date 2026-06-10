import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Compass, Settings, Sparkles, Star, Plus, Check, Lock, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { getProductMOQ } from '../lib/moq';

interface ProductInspectModalProps {
  product: Product | null;
  isBusinessVerified: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenRegister: () => void;
  onClose: () => void;
}

export default function ProductInspectModal({
  product,
  isBusinessVerified,
  onAddToCart,
  onOpenRegister,
  onClose
}: ProductInspectModalProps) {
  if (!product) return null;

  const moq = getProductMOQ(product);
  const [quantity, setQuantity] = useState(moq);
  const [isAdded, setIsAdded] = useState(false);

  // Synchronize state with MOQ requirements
  useEffect(() => {
    setQuantity(moq);
  }, [product, moq]);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-950/40 hover:bg-neutral-950/90 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-4">
          
          {/* Photo Showcase */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-850 relative">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-md text-[9px] font-mono tracking-widest text-neutral-400 px-2 py-0.5 rounded border border-neutral-800 uppercase">
                ORIGIN: {product.specs.origin || 'GLOBAL'}
              </span>
            </div>

            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-900/40">
              <span className="text-[9px] font-mono tracking-widest text-amber-500 block mb-1">CRAFT LEGACY</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                Each vessel undergoes triple helium validation checks for chamber integrity, conforming to rigid aerospace fluidic designs.
              </p>
            </div>
          </div>

          {/* Technical Spec sheet details */}
          <div className="flex flex-col justify-between h-full space-y-5">
            <div>
              <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-500 uppercase">
                {product.brand} • {product.category}
              </span>
              <h3 className="text-xl font-light text-white font-sans tracking-tight mt-1">
                {product.name}
              </h3>

              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-neutral-700'}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono text-neutral-400 font-medium font-bold">({product.rating} / 5.0 Rating)</span>
              </div>

              <div className="mt-3 text-xs text-neutral-300 font-light leading-relaxed">
                {product.description}
              </div>
            </div>

            {/* Direct Instant Order Drawer */}
            <div className="bg-neutral-955/80 p-4 rounded-xl border border-neutral-850 space-y-3">
              <span className="text-[9px] font-mono tracking-widest text-neutral-550 block uppercase font-bold">
                COMMERCIAL STOCK ALLOCATION
              </span>

              {!isBusinessVerified ? (
                <div className="p-1 text-center font-sans space-y-2">
                  <p className="text-[11px] text-neutral-400 font-light leading-relaxed">
                    Corporate pricing tiers and high-volume dispatch require dynamic registry verification.
                  </p>
                  <button
                    onClick={onOpenRegister}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-550 hover:text-amber-450 font-semibold font-mono tracking-wider cursor-pointer bg-amber-550/5 hover:bg-amber-550/15 border border-amber-550/25 py-2 rounded-lg transition-all active:scale-98"
                  >
                    <Lock size={11} />
                    <span>VERIFY MERCHANT IDENTITY</span>
                  </button>
                </div>
              ) : !product.specs.inStock ? (
                <div className="text-center py-2 text-xs font-mono text-amber-500 font-semibold">
                  ⚠️ STATUS: ALLOCATION COMPLETED
                </div>
              ) : product.price === undefined ? (
                <div className="text-center py-4 rounded-xl bg-neutral-900/70 border border-amber-500/20">
                  <p className="text-xs text-amber-300 font-medium tracking-wide">Pricing is not set for this item yet.</p>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">Contact account support to update the product cost before placing an order.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-400">
                      UNIT PRICE: {product.price !== undefined ? `$${product.price.toFixed(2)}` : 'Price on request'}
                    </span>
                    <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded leading-none uppercase">
                      B2B MOQ: {moq} PCS
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900 focus-within:border-amber-550/40 transition-colors">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(moq, prev - 1))}
                        className="px-2.5 py-1.5 text-neutral-450 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
                        title={`Minimum allocation is ${moq}`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity || ''}
                        min={moq}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val)) {
                            setQuantity(val);
                          } else {
                            setQuantity(0);
                          }
                        }}
                        onBlur={() => {
                          if (quantity < moq || isNaN(quantity)) {
                            setQuantity(moq);
                          }
                        }}
                        className="w-12 text-center bg-transparent text-xs font-mono text-white focus:outline-none focus:ring-0 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-1"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => (prev < moq ? moq + 1 : prev + 1))}
                        className="px-2.5 py-1.5 text-neutral-450 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdd}
                      className={`flex-grow rounded-lg py-2 px-3 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/10 shadow-lg'
                          : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-md shadow-amber-500/5'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={12} className="stroke-[3]" />
                          <span>ADDED {quantity} PCS</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={12} />
                          <span>ADD {quantity || moq} TO ORDER</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preset Increments */}
                  <div className="flex items-center justify-between gap-1 border-t border-neutral-900 pt-2.5 text-[9px] font-mono text-neutral-500">
                    <span className="uppercase tracking-wider">PRESET INCREMENTS:</span>
                    <div className="flex gap-1">
                      {[10, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setQuantity(prev => {
                            const cur = prev < moq ? moq : prev;
                            return cur + amt;
                          })}
                          className="text-[9px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-95"
                        >
                          +{amt}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setQuantity(moq)}
                        className="text-[9px] font-mono text-amber-550 hover:text-amber-450 bg-amber-500/5 border border-amber-500/15 px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-95 font-bold"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Technical Blueprint attributes list */}
            

            {/* Premium Highlights */}
            <div>
              <h4 className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-2 flex items-center gap-2">
                <Compass size={12} className="text-amber-500" />
                <span>INTEGRATION CORE HIGHLIGHTS</span>
              </h4>
              <ul className="space-y-1">
                {product.features.slice(0, 3).map((feature, i) => (
                  <li key={i} className="text-[11px] text-neutral-400 flex items-start gap-2 leading-relaxed">
                    <span className="h-1 w-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
