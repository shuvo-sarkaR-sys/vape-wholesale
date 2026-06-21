import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, LogOut, ShieldCheck, UserCheck, Sparkles, 
  Menu, X, Award, ChevronDown, CheckCircle2, Phone, Mail, 
  MapPin, MessageSquare, Newspaper, ExternalLink, Activity, 
  Flame, ShieldAlert, ArrowRight, TrendingUp, Compass, Send
} from 'lucide-react';
import { BusinessAccount } from '../types';
import logo from '../assets/images/logo.png';
interface NavbarProps {
  businessAccount: BusinessAccount | null;
  cartCount: number;
  onOpenCart: () => void;
  onOpenRegister: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
  isProfileMode: boolean;
  onToggleProfileMode: () => void;
  
  // Dynamic navigation links connected to the catalogue filters
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  onSelectBrand?: (brand: string) => void;
}

export default function Navbar({
  businessAccount,
  cartCount,
  onOpenCart,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  isAdminMode,
  onToggleAdminMode,
  isProfileMode,
  onToggleProfileMode,
  activeCategory = 'All',
  onSelectCategory,
  onSelectBrand
}: NavbarProps) {
  // Mobile drawer states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Overlay states
  const [showBrandsModal, setShowBrandsModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Dispatch Allocation',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');
// GEEKBAR
// • ELFBAR
// • OVNS
// • FLAVOURBEAST & BAZOOKA
// • MARZ VAPOR
// • STLTH
// • AL FAKHER/E-SHISHAS
// • MORE DISPOS

  const brandShowcases = [
    { name: 'GREEK BAR', category: 'Disposables', desc: 'Quartz glass convective disposables & e-liquids.', count: 'ps-09' },
    { name: 'ELF BAR', category: 'Pod Systems', desc: 'Machined satin brass B2B cartridge vessels.', count: 'ps-10' },
    { name: 'OVNS', category: 'Pod Systems', desc: 'Aerospace grade inductive heating equipment.', count: 'ps-12' },
    { name: 'FLAVOUR BEAST', category: 'E-Liquid', desc: 'Premium barrel-aged tobacco & fruit distillates.', count: 'ps-11' },
  {name: 'BAzOOKA', category: 'Pod Systems', desc: 'Precision quartz glass convective atomizers.', count: 'ps-04' },
    { name: 'MARZ VAPOR', category: 'Cigar Accessories', desc: 'Smart moisture humidor storage cases.', count: 'ps-02' },
    { name: 'STLTH', category: 'Pod Systems', desc: 'Precision machined magnetic pod systems.', count: 'ps-08' },
    { name: 'AL FAKHER', category: 'E-Liquid', desc: 'Premium tobacco & fruit distillates.', count: 'ps-07' },
     { name: 'Shilestial', category: 'Pouches', desc: 'Tobacco-free nicotine pouches in various flavors.', count: 'ps-06' },
    { name: 'MORE DISPOSABLES', category: 'Disposables', desc: 'Additional licensed factory lines.', count: 'ps-05' }

  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactLoading(true);

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send the contact request.');
      }

      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', topic: 'Dispatch Allocation', message: '' });
      setTimeout(() => {
        setContactSubmitted(false);
        setShowContactModal(false);
      }, 2500);
    } catch (err: any) {
      setContactError(err.message || 'Unable to send the contact request.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleBrandClick = (brandName: string) => {
    if (onSelectBrand) {
      onSelectBrand(brandName);
    }
    setShowBrandsModal(false);
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    setIsMobileMenuOpen(false);
  };

  const handleScrollToSegment = (elementId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* TIER 1: Brand Logo & User Suite Operations */}
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Left Column: Brand Logo */}
            <div 
              onClick={() => handleCategoryClick('All')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <img src={logo} alt="PUFFMANIA DISTRO" className="h-10 w-10 object-contain" />
              <span className="text-base md:text-lg font-sans tracking-[0.25em] font-light text-white uppercase">
                PUFFMANIA<span className="font-semibold text-[#A1D6DC]"> DISTRO.</span>
              </span>
              <span className="hidden xs:inline-block text-[8px] font-mono tracking-widest text-neutral-500 uppercase border border-neutral-850 px-1.5 py-0.5 rounded ml-1.5 font-medium">
                Wholesale
              </span>
            </div>

            {/* Right Column: User actions suite (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-4">
              
              {/* Account Verification Indicator */}
              {businessAccount ? (
                <button
                  onClick={onToggleProfileMode}
                  className={`flex items-center gap-2.5 bg-neutral-900 border hover:border-emerald-500/50 rounded-full pl-2.5 pr-4 py-1.5 transition-all text-left cursor-pointer group select-none ${
                    isProfileMode ? 'border-emerald-500 bg-neutral-850 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-neutral-800'
                  }`}
                  title="View Buyer Profile Workspace"
                >
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                    isProfileMode ? 'bg-emerald-500 text-neutral-950' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    <ShieldCheck size={13} className={isProfileMode ? 'scale-110' : ''} />
                  </div>
                  <div>
                    <span className={`block text-[9px] font-mono tracking-widest font-bold leading-none uppercase transition-all ${
                      isProfileMode ? 'text-emerald-300' : 'text-emerald-400'
                    }`}>
                      {isProfileMode ? 'PROFILE WORKSPACE' : 'VERIFIED BUYER'}
                    </span>
                    <span className="block text-[10px] text-neutral-200 leading-none mt-0.5 truncate max-w-[125px] font-light group-hover:text-amber-400 transition-colors">
                      {businessAccount.businessName}
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenLogin}
                    className="flex items-center gap-1.5 bg-neutral-900 border hover:border-neutral-700/65 border-neutral-800 hover:bg-neutral-850 rounded-full px-4 py-1.5 text-xs font-sans tracking-wide uppercase font-medium transition-all text-neutral-200 hover:text-white cursor-pointer"
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={onOpenRegister}
                    className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-850 text-[#A1D6DC] hover:text-amber-300 border border-[#A1D6DC/15] hover:border-[#62cdd9]/30 rounded-full px-4 py-1.5 text-xs font-sans tracking-wide uppercase font-medium transition-all cursor-pointer"
                  >
                    <UserCheck size={12} />
                    <span>Register Business</span>
                  </button>
                </div>
              )}

              {/* B2B Administration Toggle Control */}
              {/* <button
                onClick={onToggleAdminMode}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isAdminMode 
                    ? 'bg-[#62cdd9] text-neutral-950 font-bold border border-transparent shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                    : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-amber-400 border border-neutral-800'
                }`}
                title="Toggle B2B Administration Module"
              >
                <Sparkles size={11} className={isAdminMode ? 'animate-spin' : ''} />
                <span>{isAdminMode ? 'ADMIN DESK' : 'CONTROL ROOM'}</span>
              </button> */}

              {/* Cart Allocation Toggle */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full transition-all duration-300 cursor-pointer"
                aria-label="Toggle Allocation Shopping Cart"
              >
                <ShoppingCart size={18} />
                
                {/* Visual Counter badge */}
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-[#62cdd9] text-neutral-950 font-mono text-[9px] font-bold flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Catalog Log Out */}
             {/*  <button
                onClick={onLogout}
                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-950 rounded-full transition-all cursor-pointer"
                title="Lock wholesale catalogs"
              >
                <LogOut size={16} />
              </button>*/}

            </div>

            {/* Mobile Actions Container (Tidily configured) */}
            <div className="flex lg:hidden items-center gap-3">
              
              {/* Quick Small Cart access */}
              <button
                onClick={onOpenCart}
                className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-full transition-all cursor-pointer"
              >
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#62cdd9] text-neutral-950 font-mono text-[8px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-all focus:outline-none cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

            </div>

          </div>

          {/* TIER 2: Category & Wholesale Informational links (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-center border-t border-neutral-900 py-3 text-[11px] font-mono tracking-widest uppercase text-neutral-400 select-none">
            <div className="flex items-center gap-7">
              
              <button
                type="button" 
                onClick={() => setShowBrandsModal(true)}
                className="hover:text-[#62cdd9] transition-colors cursor-pointer flex items-center gap-1"
              >
                <Award size={11} className="text-[#62cdd9]" />
                <span>Top Brands</span>
                <ChevronDown size={11} />
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => handleCategoryClick('Disposables')}
                className={`hover:text-[#62cdd9] transition-colors cursor-pointer ${activeCategory === 'Disposables' ? 'text-[#62cdd9] font-semibold' : ''}`}
              >
                Disposables
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => handleCategoryClick('Pod Systems')}
                className={`hover:text-[#62cdd9] transition-colors cursor-pointer ${activeCategory === 'Pod Systems' ? 'text-[#62cdd9] font-semibold' : ''}`}
              >
                Pod Systems
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => handleCategoryClick('E-Liquid')}
                className={`hover:text-[#62cdd9] transition-colors cursor-pointer ${activeCategory === 'E-Liquid' ? 'text-[#62cdd9] font-semibold' : ''}`}
              >
                E-Liquid
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => handleCategoryClick('Pouches')}
                className={`hover:text-[#62cdd9] transition-colors cursor-pointer ${activeCategory === 'Pouches' ? 'text-[#62cdd9] font-semibold' : ''}`}
              >
                Pouches
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => handleScrollToSegment('about')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Wholesale
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => setShowTrendsModal(true)}
                className="hover:text-[#62cdd9] transition-colors cursor-pointer flex items-center gap-1 text-white hover:text-[#62cdd9]/80"
              >
                <Activity size={10} className="text-emerald-400" />
                <span>Industry Trends</span>
              </button>

              <span className="h-1 w-1 rounded-full bg-neutral-800" />

              <button 
                type="button"
                onClick={() => setShowContactModal(true)}
                className="hover:text-[#62cdd9] transition-colors cursor-pointer flex items-center gap-1 pl-1"
              >
                <MessageSquare size={10} className="text-neutral-500" />
                <span>Contact Us</span>
              </button>

            </div>
          </div>

        </div>
      </nav>

      {/* MOBILE FULL-OVERLAY NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-16 left-0 w-full z-30 bg-neutral-950 border-b border-neutral-900 overflow-y-auto max-h-[calc(100vh-64px)] shadow-2xl"
          >
            <div className="px-5 py-6 space-y-6">
              
              {/* Account Bio status on Mobile context */}
              {businessAccount ? (
                <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-850 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[8px] font-mono tracking-widest text-emerald-500 uppercase font-semibold">Verified Merchant Business</span>
                    <p className="text-sm font-medium text-white truncate mt-0.5">{businessAccount.businessName}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{businessAccount.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onToggleProfileMode();
                    }}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono font-medium tracking-wide uppercase cursor-pointer"
                  >
                    Workspace
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 py-3 px-4 rounded-xl font-sans text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-neutral-850"
                  >
                    <span>Merchant Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="w-full bg-gradient-to-r from-[#62cdd9] to-amber-600 text-neutral-950 py-3 px-4 rounded-xl font-sans text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <UserCheck size={14} />
                    <span>Register Wholesale Business</span>
                  </button>
                </div>
              )}

              {/* Main Sub Navigation Stack */}
              <div className="space-y-4">
                <span className="block text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase border-b border-neutral-900 pb-1.5">Consignment Portals</span>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowBrandsModal(true);
                    }}
                    className="bg-neutral-920 border border-neutral-850 hover:border-neutral-800 rounded-xl p-3.5 text-left space-y-1.5 transition-all text-neutral-200 cursor-pointer"
                  >
                    <Award size={14} className="text-[#62cdd9]" />
                    <p className="text-xs font-semibold tracking-tight">Top Brands</p>
                    <p className="text-[10px] text-neutral-500 font-light leading-snug">Curation filter</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setShowTrendsModal(true);
                    }}
                    className="bg-neutral-920 border border-neutral-850 hover:border-neutral-800 rounded-xl p-3.5 text-left space-y-1.5 transition-all text-emerald-400 cursor-pointer"
                  >
                    <TrendingUp size={14} className="text-emerald-400" />
                    <p className="text-xs font-semibold tracking-tight text-white">Trend Radar</p>
                    <p className="text-[10px] text-neutral-500 font-light leading-snug">Market insights</p>
                  </button>
                </div>

                <div className="space-y-1.5 pt-3">
                  <span className="block text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase mb-3 text-left">Product Departments</span>
                  
                  {[
                    { id: 'Disposables', label: 'Disposables', desc: 'Pre-filled ceramic quartz vaporizers' },
                    { id: 'Pod Systems', label: 'Pod Systems', desc: 'Refillable modular magnetic pods' },
                    { id: 'E-Liquid', label: 'E-Liquid', desc: 'Oak-barrel aged salt-nic distillates' },
                    { id: 'Pouches', label: 'Pouches', desc: 'Precision electronic enails & smart chargers' }
                  ].map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleCategoryClick(dept.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        activeCategory === dept.id 
                          ? 'bg-[#62cdd9]/10 border-[#62cdd9]/30 text-amber-400' 
                          : 'bg-neutral-920/45 border-neutral-900 text-neutral-300 hover:bg-neutral-900'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-medium tracking-wide block">{dept.label}</span>
                        <span className="text-[10px] text-neutral-500 font-light block mt-0.5">{dept.desc}</span>
                      </div>
                      <ChevronDown size={14} className="-rotate-90 text-neutral-600" />
                    </button>
                  ))}
                </div>

                {/* Auxiliary Links Stack */}
                <div className="space-y-2.5 pt-4">
                  <span className="block text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase text-left border-t border-neutral-900 pt-3">Corporate Logistics</span>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleScrollToSegment('about');
                      }}
                      className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-3.5 py-2 rounded-lg text-[10px] font-mono tracking-wider uppercase text-neutral-300 font-medium cursor-pointer"
                    >
                      Wholesale policies
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleScrollToSegment('compliance');
                      }}
                      className="bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 px-3.5 py-2 rounded-lg text-[10px] font-mono tracking-wider uppercase text-neutral-300 font-medium cursor-pointer"
                    >
                      B2B Compliance
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowContactModal(true);
                      }}
                      className="bg-neutral-900 hover:bg-neutral-850 border border-[#62cdd9]/20 hover:border-[#62cdd9]/40 px-3.5 py-2 rounded-lg text-[10px] font-mono tracking-wider uppercase text-[#62cdd9] font-medium cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare size={11} />
                      <span>Contact Bureau</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Command control actions for Mobile drawer */}
              <div className="pt-6 border-t border-neutral-900 flex flex-col gap-3">
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleAdminMode();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    isAdminMode
                      ? 'bg-[#62cdd9] text-neutral-950 font-bold'
                      : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-400 border border-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className={isAdminMode ? 'animate-spin' : ''} />
                    <span>{isAdminMode ? 'DISABLE ADMINISTRATIVE MODE' : 'ACTIVATE ADMINISTRATIVE CONSOLE'}</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 rounded-xl text-xs font-mono text-red-400 font-semibold tracking-wider uppercase cursor-pointer transition-all"
                >
                  <LogOut size={13} />
                  <span>Lock Wholesale Catalog</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP BRANDS POPOVER MODAL */}
      <AnimatePresence>
        {showBrandsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBrandsModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#62cdd9]/5 to-transparent pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.3em] font-semibold text-[#62cdd9] uppercase flex items-center gap-1.5 mb-1 bg-[#62cdd9]/10 px-2 py-0.5 rounded-full w-fit">
                    <Award size={11} />  ALL BRANDS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-1">
                    Select a <span className="font-semibold text-[#62cdd9]">Manufacture Portfolio</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    Click any licensed factory brand to extract their isolated consignment listings.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowBrandsModal(false)}
                  className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Brands grid listing */}
              <div className="space-y-3 mt-4">
                {brandShowcases.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand.name)}
                    className="w-full text-left bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-900 hover:border-[#62cdd9]/30 rounded-xl p-4 transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    {/* <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-neutral-200 group-hover:text-amber-400 transition-colors">{brand.name}</span>
                        <span className="text-[8px] font-mono uppercase bg-neutral-900 text-neutral-500 border border-neutral-850 px-1.5 py-0.5 rounded-md">
                          {brand.category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-light mt-1 tracking-wide leading-snug">{brand.desc}</p>
                    </div> */}

                    <div className="flex-shrink-0 flex items-center gap-1.5 font-mono text-[9px] text-neutral-500 group-hover:text-[#62cdd9] transition-all uppercase tracking-widest font-medium">
                      <span>{brand.name}</span>
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-950 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>Total factory integrations: 5</span>
                <span className="uppercase text-emerald-500">100% genuine B2B lines guaranteed</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDUSTRY TRENDS RADAR MODAL */}
      <AnimatePresence>
        {showTrendsModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrendsModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent pointer-events-none" />

              {/* Trends Heading */}
              <div className="flex justify-between items-start border-b border-neutral-950 pb-5 mb-6">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.3em] font-semibold text-emerald-400 uppercase flex items-center gap-1.5 mb-1.5">
                    <Activity size={12} /> PUFFMANIA DISTRO B2B TREND INTELLIGENCE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white">
                    Seasonal <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#62cdd9]/40">Consignment Forecast (Q3-Q4)</span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-light mt-1">
                    Analyse verified distribution metrics, excise rate forecasts, and consumer materials shifts for maximum margins.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowTrendsModal(false)}
                  className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* B2B Trend content */}
              <div className="space-y-6 text-xs text-neutral-300">
                
                {/* Visual Custom Chart (pure css bar chart) */}
                <div className="bg-neutral-950/80 rounded-2xl p-5 border border-neutral-955 space-y-4">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Market Share Index: Convective Glass Vaping vs. Traditional Metal</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">CONVECTIVE DOMINANCE</span>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {/* Bar 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>Quartz Glass Atomizers (e.g., Apex Air, Modular Aether)</span>
                        <span className="font-bold text-white">76% of new orders</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '76%' }} />
                      </div>
                    </div>

                    {/* Bar 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>Organic Botanical Terpene Blending (No Sweeteners)</span>
                        <span className="font-bold text-white">61% volume increase</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#62cdd9] to-amber-400 rounded-full" style={{ width: '61%' }} />
                      </div>
                    </div>

                    {/* Bar 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span>LTL Bulk Palletized Consolidated Shipments</span>
                        <span className="font-bold text-white">44% freight cost reduction</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" style={{ width: '44%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bullets with insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-xl bg-neutral-920 border border-neutral-900 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <Flame size={12} />
                      <span>1. MATERIAL SAFETY MANDATES</span>
                    </div>
                    <p className="font-light text-neutral-400 leading-relaxed text-[11px]">
                      Wholesale inventories show a fast 40% year-on-year shift from cheap plastics toward raw fused quartz glass and titanium bodies. High-end buyers prioritise neutral taste matrices and zero heavy-metal contamination guarantees.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-920 border border-neutral-900 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <ShieldAlert size={12} />
                      <span>2. EXCISE STAMPING & COMPLIANCE</span>
                    </div>
                    <p className="font-light text-neutral-400 leading-relaxed text-[11px]">
                      Upcoming Q4 state tobacco licensing shifts require strict tracing coordinates. Merchants using Pacific Smoke's verified business EIN ledger bypass physical inspection delays, shaving bulk LTL shipping transit down by average 48 hours.
                    </p>
                  </div>

                </div>

                {/* Bottom guidance */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">
                    MERCHANT RE-STOCK SUGGESTION
                  </p>
                  <p className="text-[11px] text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
                    We recommend setting allocations comprising at least <strong className="text-white">40% Disposables & Pods</strong> and <strong className="text-white">25% heating accessories</strong> to match high consumer velocity curves for early season.
                  </p>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-neutral-950 flex justify-between items-center text-[10px] font-mono text-neutral-500 select-none">
                <span>Verified since 2026</span>
                <span className="uppercase text-neutral-600">CONFIDENTIAL MULTI-STATE DISTRIBUTION BROADCAST ONLY</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT US HELP-DESK MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 text-neutral-100 z-10 shadow-2xl overflow-hidden font-sans"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#62cdd9]/5 to-transparent pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.3em] font-semibold text-[#62cdd9] uppercase flex items-center gap-1.5 mb-1 bg-neutral-950 border border-neutral-850 px-2 py-0.5 rounded-full w-fit">
                    <Phone size={10} className="text-[#62cdd9]" /> DIRECT FREIGHT HELPDESK
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light tracking-tight text-white mt-2">
                    Submit <span className="font-semibold text-[#62cdd9]">Broker Inquiry</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">
                    Need custom shipping slots or volume custom quotes? Reach our Seattle dispatcher.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!contactSubmitted ? (
                  <motion.form
                    key="contact-form"
                    onSubmit={handleContactSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    
                    {contactError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono">
                        {contactError}
                      </div>
                    )}

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Marcus Vance"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#62cdd9] font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Direct Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="vance@smikeshops.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#62cdd9] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Direct Phone</label>
                        <input
                          type="tel"
                          required
                          placeholder="(206) 555-0182"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#62cdd9] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Inquiry Department Category</label>
                      <select
                        value={contactForm.topic}
                        onChange={(e) => setContactForm({...contactForm, topic: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#62cdd9] focus:bg-neutral-950"
                      >
                        <option value="Dispatch Allocation">Consignment Vol / Allocation adjustments</option>
                        <option value="LTL Freight Cargo">LTL Freight Delivery slots</option>
                        <option value="Licensing and EIN Audit">State Compliance / License Audit</option>
                        <option value="Custom Factory Request">Custom Factory Manufacture Orders</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">Tell Our Brokerage Your Request</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write down your corporate custom inquiry instructions..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-[#62cdd9] resize-none font-sans"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={contactLoading}
                        className="w-full bg-[#62cdd9] hover:bg-amber-400 text-neutral-950 py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:translate-y-[1px] transition-all cursor-pointer"
                      >
                        {contactLoading ? (
                          <>
                            <span className="h-3 w-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                            <span>Sending message...</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Transmit Broker Dispatch Request</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[9px] text-neutral-500 font-mono text-center pt-2 uppercase">
                      Avg Response speed: under 12 minutes (business hours)
                    </p>

                  </motion.form>
                ) : (
                  <motion.div
                    key="submitted-success"
                    className="py-12 text-center flex flex-col items-center justify-center space-y-4 font-sans"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 size={24} className="animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white">Transmitted Successfully</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed font-light">
                        Your wholesale broker request has been catalogued in our Seattle office. A dispatch agent will contact you soon.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold">
                      TICKET REQ-{(1000 + Math.floor(Math.random() * 9000))} STAGED
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
