/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, ShieldCheck, Mail, Building, MapPin, Phone, 
  Award, Sparkles, Star, ChevronRight, Eye, ShieldAlert,
  SlidersHorizontal, Check, RefreshCw, ShoppingBag, 
  HelpCircle, UserCheck, ArrowRight, Compass
} from 'lucide-react';

import { Product, BusinessAccount, CartItem, Order } from './types';
import { PRODUCTS, HERO_BANNER } from './data/products';
import { getProductMOQ } from './lib/moq';

// Import custom components
import PasswordGate from './components/PasswordGate';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import RegisterModal from './components/RegisterModal';
import CartModal from './components/CartModal';
import ProductInspectModal from './components/ProductInspectModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import SmokeEffect from './components/SmokeEffect';
import AdminDashboard from './components/AdminDashboard';
import BuyerProfile from './components/BuyerProfile';
import AdminLoginModal from './components/AdminLoginModal';
import BuyerLoginModal from './components/BuyerLoginModal';

export default function App() {
  // Authentication & Session state
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(() => {
    return localStorage.getItem('pacific_password_unlocked') === 'true';
  });

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  const [businessAccount, setBusinessAccount] = useState<BusinessAccount | null>(() => {
    const saved = localStorage.getItem('pacific_business_account');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pacific_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pacific_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic products and database connection telemetry
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbType, setDbType] = useState('In-Memory Fallback');

  const fetchProducts = () => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductsList(data);
        }
      })
      .catch(err => {
        console.error('Failed to load products from full-stack API:', err);
      });
  };

  const fetchSystemStatus = () => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        setIsDbConnected(data.clientConnected);
        setDbType(data.dbType);
      })
      .catch(() => {});
  };

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Map backend orders back to standard UI structures
          const mapped: Order[] = data.map((o: any) => ({
            id: o.id,
            total: o.totalAmount,
            orderDate: o.createdAt,
            trackingNumber: `LTL-FREIGHT-${o.id.replace(/\D/g, '') || '9188'}`,
            status: o.status === 'Pending' ? 'Pending Verification' : o.status === 'Approved' ? 'Processing' : 'Shipped',
            businessAccount: {
              businessName: o.businessName,
              email: o.buyerEmail,
              address: '',
              phone: '',
              licenseNumber: o.licenseNumber,
              isVerified: true,
              registeredAt: o.createdAt
            },
            items: o.items
          }));
          setOrders(mapped);
        }
      })
      .catch(err => console.error("Failed to sync orders ledger with API:", err));
  };

  // UI state managers
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentInspectProduct, setCurrentInspectProduct] = useState<Product | null>(null);
  const [currentSuccessOrder, setCurrentSuccessOrder] = useState<Order | null>(null);

  // Modals visibility toggles
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isBuyerLoginOpen, setIsBuyerLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Admin and Desk state
  const [isProfileMode, setIsProfileMode] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(() => {
    return localStorage.getItem('pacific_admin_verified') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const isAdminPage = currentPath.startsWith('/admin-dashboard');
  const isAdminMode = isAdminPage && isAdminVerified;

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  const goHome = () => navigateTo('/');
  const goAdminPage = () => navigateTo('/admin-dashboard');
  const exitAdminPage = () => {
    if (isAdminPage) {
      goHome();
    }
  };

  // Sync state variables to Local Storage
  useEffect(() => {
    localStorage.setItem('pacific_password_unlocked', String(isPasswordUnlocked));
  }, [isPasswordUnlocked]);

  useEffect(() => {
    if (businessAccount) {
      localStorage.setItem('pacific_business_account', JSON.stringify(businessAccount));
    } else {
      localStorage.removeItem('pacific_business_account');
    }
  }, [businessAccount]);

  useEffect(() => {
    localStorage.setItem('pacific_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pacific_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pacific_admin_verified', String(isAdminVerified));
  }, [isAdminVerified]);

  // Synchronize state updates and fetch backend loads
  useEffect(() => {
    if (isPasswordUnlocked || isAdminVerified) {
      fetchProducts();
      fetchOrders();
      fetchSystemStatus();
    }
  }, [isPasswordUnlocked, isAdminVerified]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isAdminPage && !isAdminVerified) {
      setIsAdminLoginOpen(true);
      return;
    }

    if (!isAdminPage) {
      setIsAdminLoginOpen(false);
    }
  }, [isAdminPage, isAdminVerified]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number) => {
    const moq = getProductMOQ(product);
    const verifiedQuantity = Math.max(moq, quantity);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity: verifiedQuantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          const moq = getProductMOQ(item.product);
          return { ...item, quantity: Math.max(moq, quantity) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Place order
  const handlePlaceOrder = () => {
    if (!businessAccount) return;

    const subtotal = cart.reduce((acc, item) => acc + ((item.product.price ?? 0) * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 45.00;
    const tax = subtotal * 0.08;
    const finalTotal = subtotal + shipping + tax;

    // Build the formal Order manifest
    const newOrder: Order = {
      id: `PAC-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cart],
      total: finalTotal,
      businessAccount: { ...businessAccount },
      status: 'Processing',
      orderDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: `LTL-FREIGHT-${Math.floor(50000 + Math.random() * 50000)}`
    };

    // Save order securely via the express server backend (which handles MongoDB)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    })
    .then(res => res.json())
    .then(() => {
      fetchOrders();
      fetchProducts();
    })
    .catch(err => console.error("Wholesale checkout backend post failed:", err));

    setOrders(prev => [newOrder, ...prev]);
    setCurrentSuccessOrder(newOrder);
    setCart([]); // Reset the active cart
    setIsCartOpen(false);
    setIsSuccessOpen(true);
  };

  // Logout/Lock
  const handleLockCatalog = () => {
    setIsPasswordUnlocked(false);
    setBusinessAccount(null);
    setCart([]);
    exitAdminPage();
    setIsProfileMode(false);
    setIsAdminVerified(false);
    localStorage.removeItem('pacific_password_unlocked');
    localStorage.removeItem('pacific_business_account');
    localStorage.removeItem('pacific_cart');
    localStorage.removeItem('pacific_admin_verified');
  };

  // Administrative Operations
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const dbStatus = status === 'Pending Verification' ? 'Pending' : status === 'Processing' ? 'Approved' : 'Dispatched';
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: dbStatus })
    })
    .then(res => res.json())
    .then(() => {
      fetchOrders();
    })
    .catch(err => console.error("Wholesale status dispatch sync failed:", err));

    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== orderId));
  };

  const handleSimulateOrder = (order: Order) => {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
    .then(res => res.json())
    .then(() => {
      fetchOrders();
      fetchProducts();
    })
    .catch(err => console.error("Simulated order sync failed:", err));

    setOrders(prev => [order, ...prev]);
  };

  // Filter products catalog
  const filteredProducts = productsList.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoriesList = ['All', 'Disposables', 'Pod Systems', 'E-Liquid', 'Hardware', 'Vaporizers', 'Vessels', 'Cigar Accessories', 'Artisanal Pipes', 'Curated Sets'];

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(17,24,39,0.9),_transparent_50%)]" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between gap-4 border border-neutral-900 bg-neutral-950/70 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl shadow-black/20">
              <div>
                <span className="block text-[10px] uppercase tracking-[0.35em] text-amber-500 font-mono font-bold">Administrator Workspace</span>
                <h1 className="text-lg sm:text-xl font-semibold text-white">Pacific Smoke Admin Dashboard</h1>
              </div>
              <button
                type="button"
                onClick={goHome}
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 rounded-lg px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors"
              >
                Back to site
              </button>
            </div>

            <div className="mt-6">
              {isAdminVerified ? (
                <AdminDashboard
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleDeleteOrder}
                  onSimulateOrder={handleSimulateOrder}
                  onClose={goHome}
                  products={productsList}
                  onRefreshProducts={fetchProducts}
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-neutral-400 font-mono">Admin access requires sign in.</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isAdminLoginOpen && (
              <AdminLoginModal
                isOpen={isAdminLoginOpen}
                onClose={() => {
                  setIsAdminLoginOpen(false);
                  goHome();
                }}
                onLoginSuccess={() => {
                  setIsAdminVerified(true);
                  setIsAdminLoginOpen(false);
                  goAdminPage();
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Gatekeeping page view
  if (!isPasswordUnlocked) {
    return <PasswordGate onSuccess={() => setIsPasswordUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-neutral-800 flex flex-col font-sans transition-colors duration-500">
      
      {/* Navigation Header */}
      <Navbar 
        businessAccount={businessAccount}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLogin={() => setIsBuyerLoginOpen(true)}
        onLogout={handleLockCatalog}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => {
          setIsProfileMode(false);
          if (isAdminPage) {
            goHome();
          } else {
            if (isAdminVerified) {
              goAdminPage();
            } else {
              setIsAdminLoginOpen(true);
            }
          }
        }}
        isProfileMode={isProfileMode}
        onToggleProfileMode={() => {
          if (!businessAccount) {
            setIsBuyerLoginOpen(true);
          } else {
            exitAdminPage();
            setIsProfileMode(prev => !prev);
          }
        }}
        activeCategory={activeCategory}
        onSelectCategory={(category) => {
          exitAdminPage();
          setIsProfileMode(false);
          setActiveCategory(category);
          // Auto-scroll to catalog container
          setTimeout(() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onSelectBrand={(brand) => {
          exitAdminPage();
          setIsProfileMode(false);
          setActiveCategory('All');
          setSearchQuery(brand);
          // Auto-scroll to catalog container
          setTimeout(() => {
            const el = document.getElementById('catalog');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Conditional Desktop Switch: Admin Control Dashboard vs Buyer Profile vs Catalog Shopper */}
      {isAdminMode ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-grow min-h-[600px]">
          <AdminDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSimulateOrder={handleSimulateOrder}
            onClose={goHome}
            products={productsList}
            onRefreshProducts={fetchProducts}
          />
        </div>
      ) : isProfileMode && businessAccount ? (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-grow min-h-[600px]">
          <BuyerProfile
            businessAccount={businessAccount}
            orders={orders}
            onUpdateProfile={(updatedAccount) => {
              setBusinessAccount(updatedAccount);
            }}
            onClose={() => setIsProfileMode(false)}
          />
        </div>
      ) : (
        <>
          {/* Hero Header Banner */}
          <header className="relative w-full h-[550px] overflow-hidden flex items-center bg-neutral-950">
        
        {/* Dynamic Interactive Smoke Vapor Layer */}
        <SmokeEffect density={1.4} colorType="mixed" />

        {/* Background Image overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={HERO_BANNER} 
            alt="Pacific Smoke Collection Hero" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-65 scale-102 filter brightness-[0.45] transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-2xl space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] tracking-[0.4em] text-amber-500 uppercase font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full inline-flex items-center gap-2">
                <Sparkles size={11} className="animate-spin" /> EXCLUSIVE REGULATORY OUTLET
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-5xl font-light tracking-tight text-white leading-[1.1]"
            >
              The Pinnacle of <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                Premium Smoke Curations
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-sm font-light text-neutral-300 leading-relaxed max-w-lg"
            >
              Welcome to the Pacific Smoke authorized private Wholesaler portal. Explore precision-engineered vaporizers, artisanal borosilicate vessels, and smart Spanish Cedar humidors curated for specialized boutique retail establishments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              {!businessAccount ? (
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold tracking-wider text-xs uppercase py-3.5 px-6 rounded-lg flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <UserCheck size={14} />
                  <span>REGISTER TO SEE WHOLESALE PRICES</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-xs font-mono">
                  <ShieldCheck size={16} />
                  <span>COMMERCIAL LOGISTICS CLEARED FOR THE ATTACHED MERCHANT Profile</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Decorative Grid Specs sidebar subtle accent on the bottom border of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-950 to-transparent flex items-center z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between gap-4 text-[10px] font-mono text-neutral-500 tracking-wider overflow-x-auto pb-2 scrollbar-none select-none">
            <span className="flex items-center gap-1.5 whitespace-nowrap"><Award size={12} className="text-amber-500" /> SECURE STRIPED REGISTRY</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><Compass size={12} className="text-amber-500" /> HERB THERMOSTATIC CONVECTS</span>
            <span className="flex items-center gap-1.5 whitespace-nowrap"><RefreshCw size={12} className="text-amber-500" /> LTL FREIGHT ON &gt;$1K DISPATCH</span>
          </div>
        </div>
      </header>

      {/* Main Catalog View Section */}
      <main id="catalog" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        
        {/* Verification Alert Banner for guests */}
        {!businessAccount && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <span className="block text-xs font-semibold text-white tracking-wide uppercase">B2B Private Catalog Access Enabled</span>
                <p className="text-xs text-neutral-400 font-light mt-0.5 leading-relaxed">
                  You are currently browsing the catalog in guest spectator status. Pricing tables are hidden and order placement is locked. Complete the secure compliance registration below or in the navbar to unlock corporate pricing.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-semibold tracking-wider uppercase px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-center transition-all"
            >
              <span>Unlock Wholesale Checkout</span>
              <ArrowRight size={13} />
            </button>
          </motion.div>
        )}

        {/* Filter and search bar controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-neutral-900">
          
          {/* Active category filter list */}
          <div className="flex flex-wrap items-center gap-2">
            {categoriesList.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-xs font-medium tracking-wide transition-all cursor-pointer select-none ${
                  activeCategory === category
                    ? 'bg-amber-500 text-neutral-950 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-850'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Catalog Search input */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog collections..."
              className="w-full bg-neutral-900 border border-neutral-850 rounded-lg pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-neutral-500"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
              <SlidersHorizontal size={13} />
            </div>
          </div>

        </div>

        {/* Active Grid Items */}
        <div className="mt-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full border border-neutral-900 bg-neutral-950 flex items-center justify-center text-neutral-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-neutral-400">Zero matches detected</h4>
                <p className="text-xs text-neutral-500 mt-1">Try modifying your filter categories or query indices.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isBusinessVerified={!!businessAccount}
                  onAddToCart={handleAddToCart}
                  onOpenRegister={() => setIsRegisterOpen(true)}
                  onInspectDetails={(prod) => {
                    setCurrentInspectProduct(prod);
                    setIsInspectOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brand Legacy Editorial Block */}
        <section id="about" className="mt-28 py-16 px-6 sm:px-10 bg-neutral-900/20 border border-neutral-900 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-[10px] tracking-[0.3em] text-amber-500 font-mono uppercase block">ESTABLISHED 2011 • THE PACIFIC HERITAGE</span>
              
              <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-snug">
                Purity of Stream. <br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Uncompromising Engineering.</span>
              </h3>
              
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Pacific Smoke acts as the exclusive gatekeeper for the world's most progressive heating assemblies and storage boxes. We hold premium wholesale allocations representing global masters, supporting specialized merchants across North America with certified government-compliant logistical networks.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-[11px] text-neutral-300">
                <div className="border-l border-amber-500/40 pl-4 space-y-1">
                  <span className="block text-[9px] text-neutral-500 uppercase tracking-widest leading-none">REGULATORY STANDARDS</span>
                  <span className="font-semibold">FDA & Health Canada</span>
                </div>
                <div className="border-l border-amber-500/40 pl-4 space-y-1">
                  <span className="block text-[9px] text-neutral-500 uppercase tracking-widest leading-none">THERMAL RESILIENCE</span>
                  <span className="font-semibold">Aerospace Grade</span>
                </div>
              </div>
            </div>

            {/* Visual branding aesthetic container */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-850 bg-neutral-950/80 relative">
              <img
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800&h=600"
                alt="Product factory or blueprints showcase"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60 filter brightness-75 hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-neutral-950/80 backdrop-blur-md p-3 rounded-lg border border-neutral-900 text-[10px] font-mono tracking-wide">
                <span className="text-neutral-400 uppercase">INSPECTING THERMOSTAT MATRIX</span>
                <span className="text-emerald-400 font-semibold uppercase">ACTIVE-STREAM CLEARED</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Historical Orders section for verified users */}
      {businessAccount && orders.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 bg-neutral-950 border-t border-neutral-900">
          <div className="flex items-center gap-2 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <h4 className="text-xs tracking-[0.25em] font-mono text-neutral-400 uppercase">
              ACTIVE MERCHANT DISPATCH SHIPMENTS ({orders.length})
            </h4>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-neutral-900/30 border border-neutral-900 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 text-[10px] block">MANIFEST UNIQUE ID</span>
                  <span className="text-white font-semibold mt-0.5 block">{order.id}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">DELIVERY CARGO</span>
                  <span className="text-neutral-300 mt-0.5 block">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} items • Value: ${order.total.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">LTL FREIGHT CODE</span>
                  <span className="text-amber-500 mt-0.5 block font-semibold">{order.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">STATUS</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      )}

      {/* Secure footer compliance tags */}
      <footer id="compliance" className="bg-neutral-950 border-t border-neutral-900 py-12 mt-20 text-neutral-500 text-[11px] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xs text-white uppercase font-sans tracking-widest font-bold">PACIFIC SMOKE WHOLESALE</span>
              <p className="text-neutral-500 leading-relaxed font-light">
                Private commercial-only platform providing certified distribution channels across North America. Tobacco Wholesale License ID registration required standard checkouts.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-white uppercase font-sans tracking-widest font-bold">CORPORATE OFFICES</span>
              <p className="text-neutral-500 leading-relaxed font-light">
                742 Ocean Edge Drive, Suite 10, Vancouver, BC <br />
                Telephone Assistance: +1 (555) 019-2834
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs text-white uppercase font-sans tracking-widest font-bold">COMPLIANCE ASSURANCE</span>
              <p className="text-neutral-500 leading-relaxed font-light">
                All physical vessels comply with state vapor laws, featuring raw lead-free ceramics, custom borosilicates, and genuine medical-grade silicone seals.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono tracking-widest uppercase">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
              <span>© 2026 PACIFIC SMOKE INC. LUXURY SECURE PORTALS • ALL RIGHTS RESERVED.</span>
              <span className="hidden sm:inline text-neutral-850">|</span>
              <span className={`inline-flex items-center gap-1.5 ${isDbConnected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                DATABASE SECURE LOG: {dbType.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-4">
              <a href="#compliance" className="hover:text-amber-500">TERMS OF SALE</a>
              <span>•</span>
              <a href="#compliance" className="hover:text-amber-500">LICENSE DISCLOSURE</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Interactive Modals AnimatePresence portal wrapper */}
      <AnimatePresence>
        
        {/* Business compliance registration form popup */}
        {isRegisterOpen && (
          <RegisterModal
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
            onOpenLogin={() => {
              setIsRegisterOpen(false);
              setIsBuyerLoginOpen(true);
            }}
            onRegisterSuccess={(account) => {
              setBusinessAccount(account);

              // Post registration details to backend API for MongoDB storage
              fetch('/api/buyers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(account)
              })
              .then(res => res.json())
              .then(() => {
                fetchSystemStatus();
                // Refresh local buyers list key if any prefilled views
              })
              .catch(err => console.error("Wholesale registration sync failed:", err));

              // Save custom registered buyer locally
              const saved = localStorage.getItem('pacific_registered_buyers');
              const buyers = saved ? JSON.parse(saved) : [];
              if (!buyers.some((b: any) => b.email.toLowerCase() === account.email.toLowerCase())) {
                buyers.push(account);
                localStorage.setItem('pacific_registered_buyers', JSON.stringify(buyers));
              }
              setIsRegisterOpen(false);
              setIsProfileMode(true);
            }}
          />
        )}

        {/* Business Login modal overlay */}
        {isBuyerLoginOpen && (
          <BuyerLoginModal
            isOpen={isBuyerLoginOpen}
            onClose={() => setIsBuyerLoginOpen(false)}
            onLoginSuccess={(account) => {
              setBusinessAccount(account);
              setIsBuyerLoginOpen(false);
              setIsProfileMode(true);
            }}
            onOpenRegister={() => {
              setIsBuyerLoginOpen(false);
              setIsRegisterOpen(true);
            }}
          />
        )}

        {/* Cart Review Drawer Panel */}
        {isCartOpen && (
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            businessAccount={businessAccount}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onPlaceOrder={handlePlaceOrder}
            onOpenRegister={() => setIsRegisterOpen(true)}
          />
        )}

        {/* Blueprint Viewer Inspect modal */}
        {isInspectOpen && (
          <ProductInspectModal
            product={currentInspectProduct}
            isBusinessVerified={!!businessAccount}
            onAddToCart={handleAddToCart}
            onOpenRegister={() => {
              setIsInspectOpen(false);
              setIsRegisterOpen(true);
            }}
            onClose={() => {
              setIsInspectOpen(false);
              setCurrentInspectProduct(null);
            }}
          />
        )}

        {/* Finished invoice detail popup */}
        {isSuccessOpen && (
          <OrderSuccessModal
            order={currentSuccessOrder}
            onClose={() => {
              setIsSuccessOpen(false);
              setCurrentSuccessOrder(null);
            }}
          />
        )}

        {/* Admin Login Secure Verification Popup */}
        {isAdminLoginOpen && (
          <AdminLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => {
              setIsAdminLoginOpen(false);
            }}
            onLoginSuccess={() => {
              setIsAdminVerified(true);
              setIsAdminLoginOpen(false);
              goAdminPage();
            }}
          />
        )}

      </AnimatePresence>

    </div>
  );
}

