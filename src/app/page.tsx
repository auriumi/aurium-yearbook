"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; 
import { motion, useScroll, useTransform, easeOut, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  BookOpen, 
  CalendarDays,
  CheckCircle,
  LayoutGrid,
  HelpCircle,
  UserCircle,
  ScrollText,
  Trophy,
  Shield,
  Star,
  Clock,
  Ribbon,
  Users,
  Menu, 
  X,
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Anchor,
  Facebook,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuriumLandingPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const carouselRef = useRef(null);
  
  // --- REF FOR EDITIONS CAROUSEL ---
  const editionsRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // --- SCROLL HANDLER FOR EDITIONS ---
  const scrollEditions = (direction: 'left' | 'right') => {
    if (editionsRef.current) {
      const { current } = editionsRef;
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // --- DATA: GALLERY IMAGES ---
  const galleryImages = [
    "/images/gradpics/DSC_0496.jpg",
    "/images/gradpics/DSC_0938.jpg",
    "/images/gradpics/DSC_0954.jpg",
    "/images/gradpics/DSC_0963.jpg",
    "/images/gradpics/DSC_0485.jpg",
    "/images/gradpics/DSC_0486.jpg",
    "/images/gradpics/DSC_0489.jpg",
    "/images/gradpics/DSC_0491.jpg",
  ];

  // --- DATA: EDITIONS ---
  const editions = [
    {
      year: "2026",
      theme: "Layag",
      desc: "Setting sail towards new horizons. Navigating the vast ocean of opportunities with courage, resilience, and the spirit of adventure.",
      image: "/images/batch-2026.jpg", 
      overlay: "from-stone-900/10 to-stone-900/80",
      accent: "text-stone-800" 
    },
    {
      year: "2025",
      theme: "Timeless White",
      desc: "Embodying purity, elegance, and the enduring nature of memories. Like a blank canvas, it reflects the clarity and simplicity of the moments that define our journey.",
      image: "/images/batch-2025.jpg", 
      overlay: "from-stone-900/10 to-stone-900/80",
      accent: "text-stone-800" 
    },
    {
      year: "2024",
      theme: "Vintage",
      desc: "Celebrating the enduring nature of memories. Just as vintage items become more meaningful over time, our triumphs and challenges deepen in significance as we look back.",
      image: "/images/batch-2024.jpg",
      overlay: "from-amber-900/20 to-amber-950/80",
      accent: "text-amber-900"
    },
    {
      year: "2023",
      theme: "Oscars",
      desc: "Symbolizing enduring excellence. Celebrating stories that connect across generations. Teaching us that true greatness lies not only in the present but in the legacy we create.",
      image: "/images/batch-2023.jpg",
      overlay: "from-blue-900/20 to-blue-950/80",
      accent: "text-blue-900"
    },
    {
      year: "2022",
      theme: "Cinematic",
      desc: "Embracing the sparkling charm of the Oscars. Beyond the glitz, reflecting hard work and the constant pursuit of excellence—our journey filled with unforgettable cinematic moments.",
      image: "/images/batch-2022.jpg",
      overlay: "from-red-900/20 to-red-950/80",
      accent: "text-red-900"
    },
    {
      year: "2021",
      theme: "Sablay",
      desc: "Honoring the Filipino academic identity. The Sablay represents our nationalism and the triumph of our journey, woven with colors of honor, marking our transition to servant-leaders.",
      image: "/images/batch-2021.jpg", 
      overlay: "from-red-900/20 to-stone-900/80",
      accent: "text-stone-900" 
    }
  ];

  // --- DATA: STAFF / EDITORIAL BOARD ---
  const staff = [
    { year: "2025", title: "2025 Editorial Board", image: "/images/staff/staff-2025.jpg", quote: "Stewards of Excellence." },
    { year: "2024", title: "2024 Editorial Board", image: "/images/staff/staff-2024.jpg", quote: "Capturing the vintage charm of memories." },
    { year: "2023", title: "2023 Editorial Board", image: "/images/staff/staff-2023.jpg", quote: "Golden standard of service." },
    { year: "2022", title: "2022 Editorial Board", image: "/images/staff/staff-2022.jpg", quote: "Shining light on student achievements." },
    { year: "2021", title: "2021 Editorial Board", image: "/images/staff/staff-2021.jpg", quote: "Laying the foundations of digital excellence." },
    { year: "2020", title: "2020 Editorial Board", image: "/images/staff/staff-2020.jpg", quote: "Resilience in the face of changing times." },
    { year: "2019", title: "2019 Editorial Board", image: "/images/staff/staff-2019.jpg", quote: "The pioneers of the modern era." }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* --- MAINTENANCE BANNER --- */}
      <div className="fixed top-0 left-0 w-full h-16 z-[100] bg-red-600 text-white px-4 flex items-center justify-center gap-3 shadow-xl border-b-4 border-red-800">
         <AlertTriangle size={28} className="animate-pulse shrink-0 text-yellow-300" />
         <div className="flex flex-col md:flex-row md:items-center md:gap-2 text-left md:text-center leading-tight">
           <span className="font-black text-sm md:text-lg tracking-widest uppercase">System Maintenance</span>
           <span className="hidden md:inline font-black text-lg text-red-400">|</span>
           <span className="text-[10px] md:text-sm font-medium text-red-100">The site is currently undergoing maintenance. All features may be unavailable during this period</span>
         </div>
      </div>

      {/* --- NAVIGATION BAR --- */}
      <nav className="fixed top-16 z-50 w-full bg-white/95 backdrop-blur-md border-b border-amber-100/50 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between relative">
          
          {/* Mobile Burger Button (Left) */}
          <div className="lg:hidden z-50 absolute left-4">
            <Button variant="ghost" onClick={toggleMobileMenu} className="text-amber-950 p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Logo Area (Center on Mobile, Left on Desktop) */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 group z-50 mx-auto lg:mx-0">
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 md:w-12 md:h-12 overflow-hidden hover:scale-105 transition-transform duration-300">
                   <Image 
                    src="/images/umtc-logo.png" 
                    alt="UMTC Logo" 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain" 
                   />
                </div>
                <div className="h-6 md:h-8 w-[1px] bg-stone-300"></div>
                <div className="relative w-8 h-8 md:w-12 md:h-12 overflow-hidden hover:scale-105 transition-transform duration-300">
                   <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain" />
                </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-serif font-bold text-amber-950 leading-none tracking-tight">AURIUM</span>
              <span className="text-[8px] md:text-[10px] text-amber-700 uppercase tracking-[0.1em] font-bold mt-1">UM Tagum College</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-stone-600">
            <Link href="#services" className="hover:text-amber-800 hover:underline decoration-amber-400 underline-offset-4 transition-all">Services</Link>
            <Link href="#editions" className="hover:text-amber-800 hover:underline decoration-amber-400 underline-offset-4 transition-all">Editions</Link>
            <Link href="#staff" className="hover:text-amber-800 hover:underline decoration-amber-400 underline-offset-4 transition-all">The Team</Link>
            <Link href="#about" className="hover:text-amber-800 hover:underline decoration-amber-400 underline-offset-4 transition-all">About</Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-amber-900 hover:bg-amber-50 gap-2 font-medium">
                <UserCircle size={20} />
                <span className="hidden sm:inline">Portal Login</span>
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-amber-900 hover:bg-amber-800 text-white shadow-lg shadow-amber-900/20 rounded-full px-6 transition-all hover:scale-105">
                Pre-Register
              </Button>
            </Link>
          </div>

          {/* Placeholder to balance the flex layout on mobile (invisible) */}
          <div className="w-10 lg:hidden"></div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-0 w-full bg-white border-b border-amber-100 shadow-xl lg:hidden flex flex-col p-6 space-y-6 z-40"
            >
              <nav className="flex flex-col space-y-4 text-center text-lg font-serif font-medium text-stone-700">
                <Link href="#services" onClick={toggleMobileMenu} className="hover:text-amber-800 py-2 border-b border-stone-100">Services</Link>
                <Link href="#editions" onClick={toggleMobileMenu} className="hover:text-amber-800 py-2 border-b border-stone-100">Editions</Link>
                <Link href="#staff" onClick={toggleMobileMenu} className="hover:text-amber-800 py-2 border-b border-stone-100">The Team</Link>
                <Link href="#about" onClick={toggleMobileMenu} className="hover:text-amber-800 py-2 border-b border-stone-100">About</Link>
              </nav>
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/auth/register" onClick={toggleMobileMenu} className="w-full">
                  <Button className="w-full bg-amber-900 hover:bg-amber-800 text-white h-12 text-lg">
                    Pre-Register Now
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={toggleMobileMenu} className="w-full">
                  <Button variant="outline" className="w-full border-amber-200 text-amber-900 h-12 text-lg">
                    <UserCircle className="mr-2" size={20} /> Portal Login
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-36 pb-12 md:pt-48 md:pb-16 flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
           {/* Background Blobs */}
           <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-amber-200/20 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-yellow-500/10 rounded-full blur-[120px]" />
           
           {/* Texture Background */}
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply"></div>

           {/* --- SMOOTH GRADIENT FADE --- */}
           <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10"></div>
        </div>

        <div className="container relative z-20 px-4 md:px-6 text-center mt-4 md:mt-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-4 md:mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 md:gap-3 py-2 px-4 md:px-6 rounded-full bg-white/80 border border-amber-200 shadow-sm backdrop-blur-sm text-amber-900 text-[10px] md:text-xs font-bold tracking-widest uppercase">
                The Official Yearbook of UM Tagum College
              </div>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-8xl lg:text-9xl font-serif font-bold text-amber-950 mb-4 md:mb-6 leading-[1] tracking-tight drop-shadow-sm">
              A Timeless Work <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-800 italic">
                Of Art.
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-stone-600 max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed">
              We aim to produce a yearbook edition that serves as a monument to your journey. 
              Honoring and celebrating the graduating class with excellence.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-amber-900 hover:bg-amber-800 text-white px-8 md:px-10 h-14 md:h-16 text-lg rounded-full shadow-xl shadow-amber-900/20 transition-transform hover:-translate-y-1 font-bold">
                  Start Registration
                </Button>
              </Link>
              
              <div className="w-full sm:w-auto">
                <Link href="#editions" className="block w-full">
                    <Button size="lg" variant="outline" className="w-full border-amber-200 bg-white/50 backdrop-blur-sm text-amber-900 hover:bg-white px-8 md:px-10 h-14 md:h-16 text-lg rounded-full font-medium">
                        View Editions
                    </Button>
                </Link>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- VISION STATEMENT --- */}
      <section id="about" className="py-12 md:py-16 bg-white relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-amber-50/50 -skew-x-12 z-0 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
            
            {/* Left Column: Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-1/2"
            >
              <div className="inline-flex items-center gap-2 mb-4 md:mb-6">
                 <div className="h-px w-8 bg-amber-600"></div>
                 <span className="text-amber-800 text-xs font-bold uppercase tracking-widest">Our Mandate</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-amber-950 mb-6 md:mb-8 leading-tight">
                Defining the <br/>
                <span className="text-stone-400 italic">Aurium Vision</span>
              </h2>

              <div className="text-base md:text-lg text-stone-600 leading-relaxed space-y-4 md:space-y-6 text-justify border-l-2 border-stone-200 pl-6">
                <p>
                  <strong className="text-amber-900">AURIUM</strong> stands for the <em>Ambitious United Responsive Individuals of the University of Mindanao</em>. 
                </p>
                <p>
                  With every edition, we strive to make each year memorable, honoring and celebrating the graduating class of UM Tagum College. 
                  Reflecting this vision, AURIUM consistently upholds its commitment to quality service.
                </p>
                <p>
                  By maintaining the university’s renowned standard of excellence, this dedication acts as a guiding principle for the creation of each yearbook.
                </p>
              </div>
            </motion.div>

            {/* Right Column: The Main Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full md:w-1/2 relative"
            >
                {/* Floating Elements */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 z-20 bg-white p-3 rounded-xl shadow-xl border border-amber-100 hidden md:block"
                >
                    <Star className="text-yellow-400 fill-yellow-400 w-8 h-8" />
                </motion.div>

               <div className="relative bg-stone-950 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 group h-[350px] md:h-[400px] flex flex-col justify-center items-center">
                 
                 {/* Background Image */}
                 <div className="absolute inset-0 z-0">
                     <Image 
                       src="/images/gradpics/DSC_0963.jpg" 
                       alt="Standard of Excellence" 
                       fill 
                       className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
                 </div>

                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/30 transition-colors duration-1000 z-10 pointer-events-none"></div>
                 
                 {/* Content */}
                 <div className="relative z-20 flex flex-col items-center text-center p-8 md:p-12">
                     <div className="mb-4 relative">
                         <div className="absolute inset-0 bg-amber-50 blur-xl opacity-20"></div>
                         <Trophy size={56} className="text-gradient bg-clip-text text-transparent bg-gradient-to-b from-yellow-300 to-amber-600 relative z-10 drop-shadow-lg md:w-16 md:h-16 w-12 h-12" color="#fbbf24" />
                     </div>

                     <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2 tracking-wide drop-shadow-md">
                       Standard of <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">Excellence</span>
                     </h3>
                     
                     <div className="h-1 w-16 bg-amber-600 rounded-full my-4 md:my-6 shadow-sm shadow-amber-500/50"></div>

                     <p className="text-stone-200 text-base md:text-lg font-light italic leading-relaxed max-w-sm drop-shadow-sm">
                       "Producing a yearbook edition that serves as a timeless work of art."
                     </p>
                     
                     <div className="mt-6 md:mt-8 flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                         <Sparkles size={14} className="text-amber-500"/>
                         <span>Vision 2026</span>
                         <Sparkles size={14} className="text-amber-500"/>
                     </div>
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- EDITIONS GALLERY --- */}
      <section id="editions" className="py-12 md:py-16 bg-stone-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none opacity-40">
           <div className="absolute top-20 right-[-100px] w-96 h-96 bg-amber-100/50 rounded-full blur-3xl"></div>
           <div className="absolute bottom-20 left-[-100px] w-96 h-96 bg-stone-200/50 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6">
            <div className="max-w-xl">
               <span className="text-amber-700 font-bold uppercase tracking-widest text-xs mb-2 block">The Archives</span>
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-amber-950 mb-3 md:mb-4">Heritage Editions</h2>
               <p className="text-stone-500 text-base md:text-lg">A curated journey through the themes and stories that defined our history.</p>
            </div>
            
            <div className="hidden md:flex gap-3">
               <Button onClick={() => scrollEditions('left')} variant="outline" className="rounded-full w-12 h-12 p-0 border-stone-300 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 transition-all">
                  <ChevronLeft size={24} />
               </Button>
               <Button onClick={() => scrollEditions('right')} variant="default" className="rounded-full w-12 h-12 p-0 bg-amber-900 hover:bg-amber-800 text-white shadow-lg transition-all">
                  <ChevronRight size={24} />
               </Button>
            </div>
          </div>

          <div 
            ref={editionsRef}
            className="flex gap-6 overflow-x-auto pb-8 md:pb-12 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollBehavior: 'smooth' }}
          >
            {editions.map((edition, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative snap-center shrink-0 w-[85vw] md:w-[350px] flex flex-col h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 bg-white"
              >
                <div className="relative h-[280px] w-full overflow-hidden bg-stone-900">
                   <Image 
                     src={edition.image} 
                     alt={`${edition.theme} ${edition.year}`}
                     fill
                     className="object-cover transition-transform duration-700 hover:scale-105"
                   />
                   
                   <div className={`absolute inset-0 bg-gradient-to-t ${edition.overlay}`}></div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between bg-white border-t border-stone-100">
                   <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                          {edition.theme.includes("Layag") && <Anchor size={14} className="text-stone-800" />}
                          {edition.theme.includes("Oscars") && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                          {edition.theme.includes("Vintage") && <Clock size={14} className="text-amber-600" />}
                          {edition.theme.includes("Sablay") && <Ribbon size={14} className="text-red-600" />}
                          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">{edition.theme}</span>
                      </div>
                      <h3 className={`text-3xl font-serif font-bold ${edition.accent} leading-none`}>
                          {edition.year}
                      </h3>
                   </div>

                   <p className="text-stone-600 text-sm leading-relaxed mb-6">
                     {edition.desc}
                   </p>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                     <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Explore Batch</span>
                     <ArrowRight size={16} className="text-amber-800 transition-transform group-hover:translate-x-1" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="md:hidden flex justify-center gap-1 mt-2">
             {editions.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
             ))}
          </div>

        </div>
      </section>

      {/* --- MOMENTS OF TRIUMPH --- */}
      <section className="py-0 overflow-hidden bg-stone-900 border-t-4 border-b-4 border-amber-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-transparent to-stone-900 z-20 pointer-events-none"></div>

        <div className="py-8 md:py-12">
            <div className="container mx-auto px-6 mb-6 md:mb-8 text-center relative z-20">
                <div className="inline-flex items-center justify-center p-3 bg-amber-900/30 rounded-full border border-amber-800/50 backdrop-blur-sm mb-4">
                    <Camera size={24} className="text-amber-400" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-amber-50 tracking-tight">Moments of Triumph</h2>
                <p className="text-amber-200/60 mt-1 md:mt-2 text-sm md:text-base">Capturing the joy of achievement.</p>
            </div>

            <div className="flex w-full overflow-hidden relative z-0">
                <motion.div 
                    className="flex gap-4 md:gap-6 px-4 will-change-transform"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ 
                        repeat: Infinity, 
                        ease: "linear", 
                        duration: 30 
                    }}
                    style={{ width: "fit-content" }}
                >
                    {[...galleryImages, ...galleryImages].map((src, index) => (
                        <div 
                            key={index} 
                            className="relative w-[240px] h-[150px] md:w-[400px] md:h-[260px] shrink-0 rounded-lg overflow-hidden border-2 border-stone-800 shadow-2xl hover:border-amber-700 hover:scale-105 transition-all duration-300"
                        >
                            <Image 
                                src={src} 
                                alt={`Graduation Moment ${index}`} 
                                fill 
                                sizes="(max-width: 768px) 240px, 400px"
                                className="object-cover transition-all duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
      </section>

      {/* --- STAFF / EDITORIAL BOARD SECTION --- */}
      <section id="staff" className="py-12 md:py-16 bg-amber-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-10 md:mb-12">
            <div className="flex justify-center mb-3 md:mb-4">
               <Users size={28} className="text-amber-300 md:w-8 md:h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-50 mb-3 md:mb-4">The Team Behind the Legacy</h2>
            <p className="text-amber-200/80 text-base md:text-lg">The dedicated individuals who craft the AURIUM masterpiece.</p>
          </div>

          <motion.div 
             ref={carouselRef}
             className="flex gap-4 md:gap-8 overflow-x-auto pb-8 md:pb-10 px-4 md:px-0 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
             whileTap={{ cursor: "grabbing" }}
          >
             {staff.map((team, index) => (
               <Link href={`/team?year=${team.year}`} key={index} className="snap-center shrink-0 min-w-[300px] md:min-w-[400px] block focus:outline-none">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   className="bg-amber-950/50 p-4 rounded-2xl border border-amber-800/50 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-900/80 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300 h-full group"
                 >
                   <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-4 shadow-2xl">
                      <Image 
                        src={team.image} 
                        alt={team.title} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                   </div>
                   
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-100 group-hover:text-white transition-colors">{team.title}</h3>
                     
                     {/* Arrow icon animation on hover */}
                     <ArrowRight size={20} className="text-amber-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                   </div>
                   
                   <p className="text-amber-200/60 text-sm italic">"{team.quote}"</p>
                 </motion.div>
               </Link>
             ))}
          </motion.div>

          <div className="flex justify-center mt-2 text-amber-200/40 text-xs animate-pulse md:hidden">
             <span>&larr; Swipe to explore &rarr;</span>
          </div>

          <div className="flex justify-center mt-8 md:mt-12 relative z-20">
            <Link href="/team">
              <Button size="lg" className="bg-transparent border-2 border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-stone-900 rounded-full px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-bold transition-all group">
                 Explore Full Editorial Archives
                 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- GRADUATE SERVICES GRID --- */}
      <section id="services" className="py-12 md:py-16 bg-white relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-950 mb-3 md:mb-4">Graduate Services</h2>
            <p className="text-stone-500 max-w-lg mx-auto text-base md:text-lg">Everything you need to prepare for graduation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            <motion.div whileHover={{ y: -5 }} className="p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 mb-6 group-hover:bg-amber-900 group-hover:text-white transition-colors">
                <UserCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">Pre-Registration</h3>
              <p className="text-stone-500 mb-6 text-sm leading-relaxed">Create your profile, submit your details, and initialize your yearbook entry.</p>
              <Link href="/auth/register" className="text-amber-700 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                Register Now <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div id="faq" whileHover={{ y: -5 }} className="p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 transition-all group">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 mb-6 group-hover:bg-amber-900 group-hover:text-white transition-colors">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-3">FAQ</h3>
              <p className="text-stone-500 mb-6 text-sm leading-relaxed">Got questions? Find answers to common queries about the yearbook process and services.</p>
              <Link href="/faq" className="text-amber-700 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                View FAQs <ArrowRight size={16} />
              </Link>
            </motion.div>

             <Link href="/support" className="block h-full"> 
               <motion.div whileHover={{ y: -5 }} className="p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 transition-all group h-full">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 mb-6 group-hover:bg-amber-900 group-hover:text-white transition-colors">
                   <CheckCircle size={28} />
                 </div>
                 <h3 className="text-xl font-bold text-stone-800 mb-3">Help & Support</h3>
                 <p className="text-stone-500 mb-6 text-sm leading-relaxed">Having trouble with your account? Contact our support team for assistance.</p>
                 <div className="text-amber-700 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                   Get Help <ArrowRight size={16} />
                 </div>
               </motion.div>
             </Link>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-stone-950 text-stone-400 py-12 md:py-16 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12 md:mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-10 h-10 grayscale opacity-80">
                   <Image src="/images/aurium-logo.png" alt="Aurium" fill className="object-contain" />
                </div>
                <span className="text-2xl font-serif font-bold text-stone-200 tracking-wide">AURIUM</span>
              </div>
              <p className="text-stone-500 leading-relaxed max-w-sm text-sm">
                The official yearbook and alumni tracking system of UM Tagum College. <br/>
                Ambitious. United. Responsive.
              </p>
              
              <div className="mt-6">
                <a href="https://www.facebook.com/AuriumYearbook" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-500 transition-colors bg-stone-900 py-2 px-4 rounded-full border border-stone-800 hover:border-amber-500/50">
                  <Facebook size={18} />
                  <span className="text-sm font-medium">Follow us on Facebook</span>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-stone-200 mb-6 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-stone-500 text-sm">
                <li><Link href="#yearbook" className="hover:text-amber-500 transition-colors">Browse Yearbook</Link></li>
                <li><Link href="#faq" className="hover:text-amber-500 transition-colors">FAQ</Link></li>
                <li><Link href="/auth/login" className="hover:text-amber-500 transition-colors">Graduate Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-200 mb-6 uppercase tracking-widest text-xs">Legal & Support</h4>
              <ul className="space-y-4 text-stone-500 text-sm">
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/support" className="hover:text-amber-500 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 text-center md:text-left gap-4 md:gap-0">
            <p>&copy; 2026 AURIUM Yearbook Committee. All rights reserved.</p>
            <p>Designed with <span className="text-amber-900">♥</span> for the students of UMTC.</p>
          </div>
        </div>
      </footer>

    </div>  
  );
}