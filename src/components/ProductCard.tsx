import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShieldCheck, Lock, Star, ShoppingCart, Plus, Check, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { getProductMOQ } from '../lib/moq';

interface ProductCardProps {
  key?: string;
  product: Product;
  isBusinessVerified: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenRegister: () => void;
  onInspectDetails: (product: Product) => void;
}

export default function ProductCard({
  product,
  isBusinessVerified,
  onAddToCart,
  onOpenRegister,
  onInspectDetails
}: ProductCardProps) {
  const moq = getProductMOQ(product);
  const [quantity, setQuantity] = useState(moq);
  const [isAdded, setIsAdded] = useState(false);

  // Sync state if product changes or to guarantee MOQ initialization
  useEffect(() => {
    setQuantity(moq);
  }, [product, moq]);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      layout
      className="group bg-neutral-900/40 border border-neutral-900 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-800 hover:bg-neutral-900/70 transition-all duration-300 shadow-lg relative"
    >
      {/* Product Image Section */}
      <div className="relative aspect-[4/3] bg-neutral-950/80 overflow-hidden select-none">
        {/* Category tag */}
        <span className="absolute top-3 left-3 z-10 bg-neutral-950/70 backdrop-blur-md text-[9px] font-mono tracking-widest text-neutral-400 px-2 py-0.5 rounded border border-neutral-900">
          {product.category}
        </span>

        {/* Flagship Product Image with pan-zoom response */}
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Hover quick inspect overlay */}
        <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onInspectDetails(product)}
            className="bg-white hover:bg-neutral-100 text-neutral-950 rounded-full p-2.5 shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 focus:outline-none cursor-pointer"
            title="Inspect blueprints"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Out of stock alert */}
        {!product.specs.inStock && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-mono tracking-[0.3em] font-semibold text-[#62cdd9] uppercase border border-[#62cdd9]/30 px-3 py-1 bg-neutral-950 rounded-full">
              ALLOCATION COMPLETED
            </span>
          </div>
        )}
      </div>

      {/* Product Text details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
            <span className="uppercase tracking-widest">{product.brand}</span>
            <span className="flex items-center gap-0.5">
              <Star size={10} className="fill-[#62cdd9] text-[#62cdd9]" />
              {product.rating}
            </span>
          </div>

          <h4 className="text-sm font-sans tracking-tight text-white font-medium group-hover:text-[#62cdd9] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h4>

          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 font-light">
            {product.description}
          </p>
        </div>

        {/* Pricing matrix block & order controls */}
        <div className="mt-5 pt-4 border-t border-neutral-900 space-y-4">
          <div className="flex justify-between items-end">
            {/* <div>
              <span className="block text-[8px] font-mono text-neutral-500 tracking-widest uppercase">
                SUGGESTED MSRP
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {product.suggestedMSRP !== undefined ? `$${product.suggestedMSRP.toFixed(2)}` : 'TBD'}
              </span>
            </div> */}

            <div className="text-right">
              <span className="block text-[8px] font-mono text-neutral-500 tracking-widest uppercase flex items-center justify-end gap-1">
                {isBusinessVerified ? (
                  <span className="text-[#62cdd9] flex items-center gap-0.5"><ShieldCheck size={9} /> B2B WHOLESALE</span>
                ) : (
                  <span>WHOLESALE COST</span>
                )}
              </span>

              {isBusinessVerified ? (
                product.price !== undefined ? (
                  <span className="text-lg font-mono text-white font-semibold">
                    ${product.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-sm font-mono text-[#62cdd9] font-semibold">Price on request</span>
                )
              ) : (
                <button
                  onClick={onOpenRegister}
                  className="flex items-center gap-1.5 text-xs text-[#62cdd9] hover:text-[#62cdd9]/80 font-mono mt-1 group-hover:underline transition-all cursor-pointer bg-[#62cdd9]/5 hover:bg-[#62cdd9]/15 border border-[#62cdd9]/20 px-2 py-1 rounded"
                >
                  <Lock size={10} />
                  <span>Verify to see pricing</span>
                </button>
              )}
            </div>
          </div>

          {/* Cart triggers */}
          {isBusinessVerified && product.specs.inStock &&  (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                  <ShoppingCart size={10} /> ALLOCATION SIZE
                </span>
                <span className="text-[#62cdd9] font-semibold bg-[#62cdd9]/10 px-1.5 py-0.5 rounded border border-[#62cdd9]/10">
                  MOQ: {moq} UNITS
                </span>
              </div>

              <div className="flex gap-2">
                <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950 focus-within:border-[#62cdd9]/40 transition-colors">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(moq, prev - 1))}
                    className="px-2.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none cursor-pointer"
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
                    className="px-2.5 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors focus:outline-none cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-grow rounded-lg py-2 px-2 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-1 transition-all duration-300 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/10 shadow-lg'
                      : 'bg-[#62cdd9] text-neutral-950 hover:bg-[#62cdd9]/80 shadow-md shadow-[#62cdd9]/5'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={12} className="stroke-[3]" />
                      <span>ADDED {quantity} UNITS</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} className="stroke-[3]" />
                      <span>ADD TO CART</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Increments */}
              <div className="flex items-center justify-between gap-1.5 bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-900/60">
                <span className="text-[8px] font-mono text-neutral-500 pl-1 uppercase tracking-wider">BULK:</span>
                <div className="flex gap-1">
                  {[5, 10, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setQuantity(prev => {
                        const current = prev < moq ? moq : prev;
                        return current + amt;
                      })}
                      className="text-[9px] font-mono text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-95"
                    >
                      +{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuantity(moq)}
                    className="text-[9.5px] font-mono text-[#62cdd9] bg-[#62cdd9]/5 hover:bg-[#62cdd9]/15 border border-[#62cdd9]/15 hover:border-[#62cdd9]/40 px-1.5 py-0.5 rounded cursor-pointer transition-all active:scale-95 flex items-center gap-0.5 font-bold"
                    title="Reset to B2B Minimum Order Quantity"
                  >
                    RESET
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
