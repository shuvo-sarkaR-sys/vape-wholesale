import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, ArrowRight, Package, Printer, ExternalLink } from 'lucide-react';
import { Order } from '../types';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  if (!order) return null;

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

      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />

        <div className="flex flex-col items-center text-center mt-4">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 animate-pulse">
            <ShieldCheck size={28} />
          </div>

          <span className="text-[10px] tracking-[0.3em] text-emerald-400 font-mono uppercase mb-1">LOGISTICS TRANSMISSION COHERENT</span>
          <h3 className="text-xl font-light text-white font-sans tracking-tight">
            Wholesale Order <span className="font-semibold text-emerald-400">Successfully Placed</span>
          </h3>
          <p className="text-xs text-neutral-400 font-light max-w-sm mt-3 leading-relaxed">
            Your bulk order has been successfully transmitted to our distribution terminals. The invoice has been auto-certified against your business EIN tax account.
          </p>
        </div>

        {/* Invoice details body */}
        <div className="mt-8 bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
          
          <div className="flex justify-between items-center text-xs border-b border-neutral-900 pb-3">
            <div>
              <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider">DOC / ORDER IDENTIFICATION</span>
              <span className="font-mono text-neutral-200 mt-0.5 block font-semibold">{order.id}</span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider">LTL DISPATCH TRACKING</span>
              <span className="font-mono text-amber-500 mt-0.5 block font-semibold">{order.trackingNumber}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider mb-2">ALLOCATION CARGO SUMMARY</span>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-neutral-300 font-light">
                <span className="line-clamp-1 max-w-[220px]">{item.product.name} (x{item.quantity})</span>
                <span className="font-mono">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-900 pt-3 flex justify-between items-end">
            <div>
              <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider">CORPORATE CONSIGNEE</span>
              <span className="text-xs font-semibold text-neutral-300 block max-w-[240px] truncate">{order.businessAccount.businessName}</span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-wider text-right">TOTAL DEBIT</span>
              <span className="text-sm font-semibold font-mono text-amber-400">${order.total.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Next logistical steps */}
        <div className="mt-6 flex gap-3 text-left bg-neutral-950/40 p-3.5 border border-neutral-900/60 rounded-xl">
          <Truck size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-medium text-neutral-200 font-sans">LTL Freight Dispatch Pending</span>
            <p className="text-[11px] text-neutral-400 font-light leading-relaxed mt-1">
              Estimated cargo delivery is scheduled in 3-5 standard business days. An entry clerk will follow up with direct telephone validation at <span className="text-neutral-200 font-mono font-medium">{order.businessAccount.phone}</span>.
            </p>
          </div>
        </div>

        {/* Buttons Suite */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-800 rounded-lg py-2.5 px-4 text-xs font-semibold tracking-wider uppercase font-sans flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={13} />
            <span>Save Invoice</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-white hover:bg-neutral-100 text-neutral-950 rounded-lg py-2.5 px-4 text-xs font-bold tracking-wider uppercase font-sans flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Proceed</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
