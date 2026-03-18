"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronDown, 
  Search, 
  UserCircle, 
  CalendarDays, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- FAQ DATA (Extracted from your Apps Script Logic) ---
const faqCategories = [
  {
    title: "Account & Login",
    icon: UserCircle,
    questions: [
      {
        q: "Can I log in using my email address?",
        a: "Yes. The system accepts either your Student ID Number (e.g., 2022-00123) OR your registered personal Email address to access the portal."
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "Use the 'Forgot Password' link on the login page. The system will automatically generate a 6-digit verification code and send it to your registered email. You will need this code to set a new password."
      },
      {
        q: "I'm getting a 'Username or Email Already Exists' error during registration.",
        a: "This means you likely already have an account from a previous session or academic year. Instead of registering again, please try logging in or using the 'Forgot Password' feature."
      }
    ]
  },
  {
    title: "The Yearbook Process",
    icon: FileText,
    questions: [
      {
        q: "What are the requirements to be included in the yearbook?",
        a: "There are three mandatory steps to ensure your inclusion: 1) Complete Pre-Registration in the Aurium Portal, 2) Secure RAC Endorsement (your ID must be verified by the Registrar), and 3) Attend your scheduled Pictorial session."
      },
      {
        q: "My status says 'Pending Endorsement'. What does this mean?",
        a: "This means your Student ID has not yet been officially verified by the Registrar (RAC) in our database. We update the endorsed list periodically. If you believe this is an error, please visit the registrar's office."
      },
      {
        q: "Can I upload my own photo?",
        a: "Photos must be taken during the official pictorial schedule to ensure consistent quality and lighting for the yearbook. Personal uploads are only allowed for specific 'Creative' shots if approved by the editorial board."
      }
    ]
  },
  {
    title: "Pictorial Schedules",
    icon: CalendarDays,
    questions: [
      {
        q: "How do I find my photoshoot schedule?",
        a: "Once logged in, navigate to the 'Schedule' tab on your dashboard. If your schedule has been approved, you will see your specific Date, Time, and Session (AM/PM)."
      },
      {
        q: "It says 'ID Not Found' when I check my schedule.",
        a: "This indicates that you have not been assigned a slot yet. Schedules are released in batches based on your program/college. Please ensure you have completed Pre-Registration first to be queued for a slot."
      },
      {
        q: "What happens if I miss my scheduled session?",
        a: "Missed sessions may result in exclusion from the yearbook unless a valid reason is provided. You must contact support immediately to check for available makeup slots."
      }
    ]
  }
];

// --- ACCORDION COMPONENT ---
const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-stone-200 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full py-5 text-left group"
      >
        <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-amber-800' : 'text-stone-700 group-hover:text-amber-800'}`}>
          {question}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-stone-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-600' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-stone-500 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200 selection:text-amber-900 font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-stone-900 text-white py-20 relative overflow-hidden">
        {/* Background Decors */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-stone-800/50 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <Link href="/">
            <Button variant="ghost" className="text-stone-400 hover:text-white hover:bg-white/10 mb-8 pl-0 gap-2">
              <ArrowLeft size={20} /> Back to Home
            </Button>
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">Help Center</h1>
            <p className="text-xl text-stone-400 leading-relaxed">
              Frequently asked questions about the yearbook process, login issues, and schedules. 
              <br className="hidden md:block"/> Based on the official AURIUM guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="container mx-auto px-6 py-16 md:py-24 -mt-10">
        <div className="grid gap-8 max-w-4xl mx-auto">
          
          {faqCategories.map((category, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-stone-200/50 border border-stone-100"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-800">
                  <category.icon size={24} />
                </div>
                <h2 className="text-2xl font-bold text-stone-800">{category.title}</h2>
              </div>

              <div>
                {category.questions.map((item, qIdx) => (
                  <AccordionItem key={qIdx} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}

          {/* TODO: Hide for now, this is not functional.. 
          --- STILL NEED HELP? ---
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg border border-stone-100 mb-6">
              <AlertCircle className="text-amber-600 mr-2" size={24} />
              <span className="text-stone-600 font-medium">Still have questions?</span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-stone-800 mb-4">We're here to help</h3>
            <p className="text-stone-500 mb-8">If you can't find the answer you're looking for, please contact our support team.</p>
            <div className="flex justify-center gap-4">

               <Link href="/support">
                 <Button className="bg-stone-900 hover:bg-stone-800 text-white px-8 h-12 rounded-full text-lg">
                   Contact Support
                 </Button>
               </Link>
               <Link href="/login">
                 <Button variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 h-12 rounded-full text-lg">
                   Log In to Portal
                 </Button>
               </Link>
            </div>
          </div>
          */}

        </div>
      </div>

    </div>
  );
}