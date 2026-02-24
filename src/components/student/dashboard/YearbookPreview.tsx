"use client";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Quote, 
  GraduationCap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types";

interface YearbookPreviewProps {
  user: Student;
  onClose: () => void; 
}

export function YearbookPreview({ user, onClose }: YearbookPreviewProps) {
  const stud_detail = user.studentDetail;

  //if there's a guardian, means no parent info
  const guardian = stud_detail.guardians_name;

  const details = {
    personal: {
      fname: user?.first_name,
      mname: user?.mid_name,
      lname: user?.last_name,
      suffix: user?.suffix,
      nickname: user?.first_name, 
      birthdate: new Date(stud_detail.birth_date).toLocaleDateString(),
    },
    address: {
      barangay: stud_detail.barangay,
      city: stud_detail.city,
      province: stud_detail.province
    },
    academic: {
      course: user?.course,
      major: user?.major,
      thesis: user?.thesis_title,
      email: user?.personal_email,
      contact: stud_detail.contact_num
     },
     family: {
        guardian: stud_detail?.guardians_name,
        father: stud_detail?.fathers_name,
        mother: stud_detail?.mothers_name,
     }
  };

  const photoUrl = user?.photo_url || "https://i.pinimg.com/736x/09/7b/2d/097b2d53634008344447550541004724.jpg";

  return (
    // BAG-O: Gidugangan og "fixed inset-0 z-50 overflow-y-auto" para mahimo siyang overlay/modal imbes nga bag-ong page.
    <div className="fixed inset-0 z-50 overflow-y-auto min-h-screen bg-[#2a1a10] text-amber-50 font-sans selection:bg-amber-500/30">
      
      {/* FLOATING BACK BUTTON - UPDATED CONTRAST */}
      <div className="fixed top-4 left-4 z-50">
        {/* BAG-O: Gitangtang ang Link, gibutangan og onClick={onClose} */}
        <Button 
          onClick={onClose}
          className="bg-white/90 text-stone-900 hover:bg-white hover:text-black border border-white rounded-full gap-2 shadow-lg transition-all hover:scale-105 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>

      {/* FLOATING BADGE */}
      <div className="fixed top-4 right-4 z-50">
         <Badge className="bg-amber-600 hover:bg-amber-600 text-white border-none shadow-lg">DRAFT PREVIEW</Badge>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      {/* Desktop: Grid with 2 Columns (40% / 60%). Mobile: Flex Column */}
      <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row">
        
        {/* --- LEFT: PHOTO SECTION (40% width on Desktop) --- */}
        <div className="w-full lg:w-[40%] bg-stone-100 relative flex items-center justify-center p-8 lg:p-12 order-1 pt-24 lg:pt-12">
            {/* White Frame Effect */}
            <div className="bg-white p-4 shadow-2xl rotate-1 w-full max-w-md mx-auto relative z-10">
                {/* Image Container with fixed aspect ratio */}
                <div className="aspect-[3/4] w-full bg-stone-200 relative overflow-hidden">
                   <img 
                     src={photoUrl} 
                     alt="Graduation Portrait" 
                     className="w-full h-full object-cover" 
                   />
                </div>
                {/* Name Tag on Photo */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#2a1a10] text-white px-6 py-2 shadow-lg w-max max-w-[90%] text-center">
                   <span className="text-xl font-serif font-bold tracking-widest truncate block">{details.personal.lname}</span>
                </div>
            </div>

            {/* Pattern Overlay on Left Side */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-multiply"></div>
        </div>

        {/* --- RIGHT: DETAILS SECTION (60% width on Desktop) --- */}
        <div className="w-full lg:w-[60%] bg-[#3f2e22] relative flex flex-col justify-center p-8 md:p-16 lg:p-20 order-2 pt-16 lg:pt-8">
            {/* Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/leather.png')" }}></div>

            <div className="relative z-10 max-w-3xl mx-auto w-full">
                
                {/* HEADER */}
                <div className="border-b border-amber-500/30 pb-8 mb-8">
                   <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-2 tracking-tight">
                     {details.personal.lname},
                   </h1>
                   <div className="flex flex-wrap items-baseline gap-3 text-2xl md:text-4xl text-amber-100/80 font-serif">
                     <span>{details.personal.fname}</span>
                     <span>{details.personal.mname.charAt(0)}.</span>
                     <span className="italic text-amber-500">"{details.personal.nickname}"</span>
                   </div>
                   <div className="mt-6 flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-sm font-bold tracking-[0.2em] uppercase text-amber-200 leading-snug">
                        {details.academic.course}
                      </p>
                   </div>
                   {details.academic.major !== "N/A" && (
                       <p className="text-xs tracking-widest uppercase text-amber-500/60 mt-1 pl-8">{details.academic.major}</p>
                   )}
                </div>

                {/* CONTENT GRID */}
                <div className="flex flex-col md:flex-row gap-10">
                    
                    {/* THEME PHOTO BOX (Placeholder) */}
                    <div className="hidden md:block w-48 shrink-0">
                       <div className="aspect-[3/4] bg-white/5 border border-white/10 p-2 relative group cursor-not-allowed">
                          <div className="w-full h-full bg-[#2a1a10] flex flex-col items-center justify-center text-center p-4">
                             <span className="text-[10px] uppercase tracking-widest text-amber-500/50">Theme Photo Slot</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                       </div>
                    </div>

                    {/* DETAILS TEXT */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 text-sm font-light text-amber-100/80">
                       
                       <div className="space-y-6">
                          <div>
                             <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-widest mb-1">Birthdate</h4>
                             <p className="text-base text-white">{details.personal.birthdate}</p>
                          </div>
                          <div>
                             <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-widest mb-1">Hometown</h4>
                             <div className="flex items-start gap-2">
                                <MapPin className="w-3 h-3 mt-1 shrink-0 text-amber-500" />
                                <p>{`${details.address.barangay}, ${details.address.city}, ${details.address.province}`}</p>
                             </div>
                          </div>
                          <div>
                             <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-widest mb-1">Contact</h4>
                             <div className="space-y-1">
                                <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-amber-500" /> {details.academic.contact}</p>
                                <p className="flex items-center gap-2 break-all"><Mail className="w-3 h-3 text-amber-500" /> {details.academic.email}</p>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div>
                             <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-widest mb-1">
                              {guardian ? "Guardian" : "Parents"}
                             </h4>
                             <div className="space-y-1">
                                {guardian ? (
                                   <p>{details.family.guardian}</p>
                                ) : (
                                   <>
                                      <p>{details.family.father}</p>
                                      <p>{details.family.mother}</p>
                                   </>
                                )}
                             </div>
                          </div>
                          <div>
                             <h4 className="font-bold text-amber-500 text-[10px] uppercase tracking-widest mb-2">Thesis Title</h4>
                             <div className="relative pl-4 border-l-2 border-amber-500">
                                <Quote className="w-3 h-3 text-amber-500 absolute -top-2 -left-[5px] bg-[#3f2e22]" />
                                <p className="italic text-white leading-relaxed">
                                   "{details.academic.thesis}"
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}