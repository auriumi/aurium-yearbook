"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Sparkles, Users, Award, Star, X } from "lucide-react";

const STAFF_ARCHIVES = {
  "2025": { count: 12, folder: "AURIUM Staff 2025", groupPic: "GROUP PHOTO.jpg" },
  "2024": { count: 11, folder: "AURIUM Staff 2024", groupPic: "GROUP PHOTO.jpg" },
  "2023": { count: 11, folder: "AURIUM Staff 2023", groupPic: "AURIUM 2023_GROUP PHOTO.jpg" },
  "2022": { count: 12, folder: "AURIUM Staff 2022", groupPic: "Group Photo.jpg" },
  "2021": { count: 10, folder: "AURIUM Staff 2021", groupPic: "Group Photo.jpg" },
};

type YearKey = keyof typeof STAFF_ARCHIVES;
const YEARS = Object.keys(STAFF_ARCHIVES).sort((a, b) => parseInt(b) - parseInt(a)) as YearKey[];

export default function EditorialBoardPage() {
  const [activeYear, setActiveYear] = useState<YearKey>("2025");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Read URL parameters to auto-select the active year tab
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const yearParam = searchParams.get("year");
    if (yearParam && Object.keys(STAFF_ARCHIVES).includes(yearParam)) {
      setActiveYear(yearParam as YearKey);
    }
  }, []);

  const currentData = STAFF_ARCHIVES[activeYear];
  const basePath = `/images/AURIUM Yearbook Staff Photos (2021-2025)/${currentData.folder}`;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-500 selection:text-stone-900 font-sans pb-24">
      
      {/* --- MINIMAL NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 text-stone-400 hover:text-amber-500 transition-colors">
            <div className="p-2 rounded-full bg-stone-900 group-hover:bg-amber-900/30 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium tracking-wide text-sm uppercase">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 opacity-80"><Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain" /></div>
             <span className="text-xl font-serif font-bold text-amber-50 tracking-widest uppercase">Aurium</span>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-36 pb-16 overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-amber-900/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-800/50 bg-amber-900/20 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
              <Star size={14} /> The Editorial Board
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg">
              Faces Behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700 italic">Legacy</span>
            </h1>
            <p className="text-stone-400 max-w-2xl mx-auto text-lg md:text-xl">
              Honoring the brilliant minds and dedicated hands that crafted the university's timeless masterpiece across the years.
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- YEAR SELECTOR (TABS) --- */}
      <div className="sticky top-20 z-40 bg-stone-950/90 backdrop-blur-xl border-y border-stone-800 py-4 mb-12 shadow-2xl">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide p-1 bg-stone-900 rounded-full border border-stone-800">
            {YEARS.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`relative px-6 md:px-8 py-3 text-sm md:text-base font-bold rounded-full transition-all duration-300 ${
                  activeYear === year ? "text-stone-900" : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {activeYear === year && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-300 to-amber-600 rounded-full shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                   {year}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- GALLERY SECTION --- */}
      <div className="container mx-auto px-4 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeYear}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            
            {/* 1. THE GROUP PHOTO */}
            <motion.div 
              variants={itemVariants} 
              onClick={() => setSelectedImage(`${basePath}/${currentData.groupPic}`)}
              className="relative w-full rounded-3xl overflow-hidden border border-stone-800 shadow-2xl group bg-stone-900 flex justify-center items-center cursor-zoom-in"
            >
              <Image 
                src={`${basePath}/${currentData.groupPic}`} 
                alt={`Aurium Staff ${activeYear} Group Photo`}
                width={1920}
                height={1080}
                className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-105"
                unoptimized 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pointer-events-none">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-amber-500 w-8 h-8" />
                  <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">Batch {activeYear}</h2>
                </div>
                <p className="text-stone-300 text-lg md:text-xl font-light">The Complete Editorial Board</p>
              </div>
            </motion.div>

            {/* 2. INDIVIDUAL STAFF GRID */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-stone-800"></div>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-500 uppercase tracking-widest flex items-center gap-3">
                  <Users size={24} /> Individual Portraits
                </h3>
                <div className="h-px flex-1 bg-stone-800"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-6 items-start">
                {Array.from({ length: currentData.count }).map((_, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    onClick={() => setSelectedImage(`${basePath}/${i + 1}.jpg`)}
                    className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 group cursor-zoom-in shadow-lg flex justify-center items-center"
                  >
                    <Image 
                      src={`${basePath}/${i + 1}.jpg`} 
                      alt={`Staff ${activeYear} member ${i + 1}`}
                      width={800}
                      height={1000}
                      className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500/50 rounded-2xl transition-all duration-500 z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-sm"
          >
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute top-6 right-6 text-white/50 hover:text-amber-500 z-[101] bg-black/50 p-2 rounded-full transition-colors"
            >
              <X size={32}/>
            </button>
            
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-full max-h-full flex justify-center items-center"
            >
              <Image 
                src={selectedImage} 
                alt="Expanded View" 
                width={1200} 
                height={1600} 
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10" 
                unoptimized 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}