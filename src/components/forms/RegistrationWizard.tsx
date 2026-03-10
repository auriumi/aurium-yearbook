"use client";
const baseUrl = process.env.NEXT_PUBLIC_LOCAL_URL || "";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

// SOLID: Pag-import sa mga isolated Step Components ug Constants
import { departmentOptions } from "@/components/registration/RegistrationConstants";
import { PersonalStep } from "@/components/registration/PersonalStep";
import { AddressStep } from "@/components/registration/AddressStep";
import { AcademicStep } from "@/components/registration/AcademicStep";
import { FamilyStep } from "@/components/registration/FamilyStep";
import { ReviewStep } from "@/components/registration/ReviewStep";
import { PrivacyStep } from "@/components/registration/PrivacyStep";
import toast from "react-hot-toast";

const steps = [
  { id: 1, name: "Personal", title: "Personal Information" },
  { id: 2, name: "Address", title: "Home Address" },
  { id: 3, name: "Academic", title: "Academic & Contact" },
  { id: 4, name: "Family", title: "Parents or Guardian" },
  { id: 5, name: "Review", title: "Review Details" }, 
  { id: 6, name: "Privacy", title: "Data Privacy" },
];

export default function RegistrationWizard() {

  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0); 
  const [isOnline, setIsOnline] = useState(true); 

  // --- STATE: Personal ---
  const [idNumber, setIdNumber] = useState(""); 
  const [lname, setLname] = useState("");
  const [fname, setFname] = useState("");
  const [mname, setMname] = useState("");
  const [suffix, setSuffix] = useState("");
  const [nickname, setNickname] = useState(""); 
  const [bdate, setBdate] = useState("");
  
  const formattedBirthdate = useMemo(() => {
    if (!bdate) return "-";
    const date = new Date(bdate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [bdate]);

  // --- STATE: Address (Dynamic API Data Only) ---
  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [barangayList, setBarangayList] = useState<any[]>([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedBarangayCode, setSelectedBarangayCode] = useState("");

  const provinceName = useMemo(() => provinceList.find(p => String(p.code) === selectedProvinceCode)?.name || "", [selectedProvinceCode, provinceList]);
  const cityName = useMemo(() => cityList.find(c => String(c.code) === selectedCityCode)?.name || "", [selectedCityCode, cityList]);
  const barangayName = useMemo(() => barangayList.find(b => String(b.code) === selectedBarangayCode)?.name || "", [selectedBarangayCode, barangayList]);

  const sortProvinces = (data: any[]) => {
    const priorityNames = ["Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental"];
    const normalizedData = data.map(p => { return { ...p, name: p.name === "Compostela Valley" ? "Davao de Oro" : p.name }; });
    const priorityProvinces = normalizedData.filter(p => priorityNames.includes(p.name)).sort((a, b) => priorityNames.indexOf(a.name) - priorityNames.indexOf(b.name));
    const otherProvinces = normalizedData.filter(p => !priorityNames.includes(p.name)).sort((a, b) => a.name.localeCompare(b.name));
    return [...priorityProvinces, ...otherProvinces];
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const res = await fetch("https://psgc.cloud/api/provinces");
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        setProvinceList(sortProvinces(data));
        setIsOnline(true);
      } catch (err) {
        console.error("Failed to load provinces:", err);
        setIsOnline(false); 
        setProvinceList([]); 
      } finally { setIsLoadingProvinces(false); }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!selectedProvinceCode) { setCityList([]); return; }
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`https://psgc.cloud/api/provinces/${selectedProvinceCode}/cities-municipalities`);
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        setCityList(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        setIsOnline(true);
      } catch (err) {
        console.error("Failed to load cities:", err);
        setIsOnline(false); setCityList([]);
      } finally { setIsLoadingCities(false); }
    };
    fetchCities();
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!selectedCityCode) { setBarangayList([]); return; }
    const fetchBarangays = async () => {
      setIsLoadingBarangays(true);
      try {
        const res = await fetch(`https://psgc.cloud/api/cities-municipalities/${selectedCityCode}/barangays`);
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        setBarangayList(data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        setIsOnline(true);
      } catch (err) {
        console.error("Failed to load barangays:", err);
        setIsOnline(false); setBarangayList([]);
      } finally { setIsLoadingBarangays(false); }
    };
    fetchBarangays();
  }, [selectedCityCode]);

  const handleProvinceChange = (code: string) => { setSelectedProvinceCode(code); setSelectedCityCode(""); setSelectedBarangayCode(""); };
  const handleCityChange = (code: string) => { setSelectedCityCode(code); setSelectedBarangayCode(""); };

  // --- STATE: Academic & Other ---
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [thesisTitle, setThesisTitle] = useState(""); 
  const [contactNum, setContactNum] = useState("");
  const [email, setEmail] = useState("");
  const [umEmail, setUmEmail] = useState(""); 
  const [hasUmEmailAccess, setHasUmEmailAccess] = useState(true);

  // --- STATE: Family ---
  const [useGuardian, setUseGuardian] = useState(false);
  const [fatherTitle, setFatherTitle] = useState("Mr.");
  const [fatherFname, setFatherFname] = useState("");
  const [fatherLname, setFatherLname] = useState("");
  const [fatherMname, setFatherMname] = useState("");
  const [fatherSuffix, setFatherSuffix] = useState("");
  const [motherTitle, setMotherTitle] = useState("Mrs.");
  const [motherFname, setMotherFname] = useState("");
  const [motherLname, setMotherLname] = useState("");
  const [motherMname, setMotherMname] = useState("");
  const [guardianTitle, setGuardianTitle] = useState("Mrs.");
  const [guardianFname, setGuardianFname] = useState("");
  const [guardianLname, setGuardianLname] = useState("");
  const [guardianRel, setGuardianRel] = useState("");

  // --- STATE: Review & Privacy ---
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const currentCourses = useMemo(() => departmentOptions.find(d => d.name === selectedDepartment)?.courses || [], [selectedDepartment]);
  const currentMajors = useMemo(() => currentCourses.find(c => c.name === selectedCourse)?.majors || [], [selectedCourse, currentCourses]);

  const handleDepartmentChange = (value: string) => { setSelectedDepartment(value); setSelectedCourse(""); setSelectedMajor("");  };
  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    const courseData = currentCourses.find(c => c.name === value);
    setSelectedMajor(courseData && courseData.majors.length === 0 ? "N/A" : "");
  };

  const isStepValid = () => {
    const isValidEmailFormat = (emailStr: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

    switch (currentStep) {
      case 1: return idNumber.trim() !== "" && lname.trim() !== "" && fname.trim() !== "" && bdate !== "";
      case 2: return selectedProvinceCode !== "" && selectedCityCode !== "" && selectedBarangayCode !== "";
      case 3: 

        const isBaseAcademicValid = selectedDepartment !== "" && selectedCourse !== "" && selectedMajor !== "" && thesisTitle.trim() !== "" && contactNum.trim() !== "" && isValidEmailFormat(email);
        
        if (hasUmEmailAccess) {
            return isBaseAcademicValid && isValidEmailFormat(umEmail);
        }
        return isBaseAcademicValid;
        
      case 4: return useGuardian ? (guardianLname.trim() !== "" && guardianFname.trim() !== "" && guardianRel.trim() !== "") : ((fatherLname.trim() !== "" && fatherFname.trim() !== "") && (motherLname.trim() !== "" && motherFname.trim() !== ""));
      case 5: return reviewConfirmed;
      case 6: return privacyAgreed;   
      default: return false;
    }
  };

  const handleNext = () => { if (currentStep < steps.length && isStepValid()) { setDirection(1); setCurrentStep((prev) => prev + 1); } };
  const handleBack = () => { if (currentStep > 1) { setDirection(-1); setCurrentStep((prev) => prev - 1); } };
  const jumpToStep = (stepId: number) => { if (stepId < currentStep) { setDirection(-1); setCurrentStep(stepId); } };

  const onSubmit = async () => {
    const relation: any = useGuardian ? { 
      guardian: { 
        guardians_name: `${guardianFname} ${guardianLname}`, 
        relationship: guardianRel 
      } 
    } : { 
      parent: {
       fathers_name: `${fatherFname} ${fatherMname} ${fatherLname}`, 
       fathers_title: fatherTitle,
       fathers_suffix: fatherSuffix,
       mothers_name: `${motherFname} ${motherMname} ${motherLname}`, 
       mothers_title: motherTitle,
      } 
    };
    
    const body = { 
        id: idNumber, 
        personal_email: email, 
        school_email: hasUmEmailAccess ? umEmail : "", 
        last_name: lname, 
        first_name: fname, 
        middle_name: mname, 
        suffix: suffix, 
        nickname: nickname, 
        birthdate: bdate, 
        contact_num: contactNum, 
        academics: { department: selectedDepartment, course: selectedCourse, major: selectedMajor, thesis: thesisTitle }, 
        ...relation, 
        province: provinceName, 
        city: cityName, 
        barangay: barangayName 
    };

    try {
      const res = await fetch(`${baseUrl}/api/student/submit`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      toast.success("Information has been submitted succesfully!")
      router.push('/');

    } catch (err) { 
      console.error("Something went wrong..", err); 
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden"><Image src="/images/umtc-logo.png" alt="UMTC Logo" fill className="object-contain"/></div>
                <div className="h-6 w-[1px] bg-stone-300"></div>
                <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden"><Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain"/></div>
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-xl font-serif font-bold text-amber-950 leading-none tracking-tight">AURIUM</span>
              <span className="text-[8px] md:text-[10px] text-amber-700 uppercase tracking-[0.1em] font-bold mt-0.5">Registration</span>
            </div>
          </Link>
          <Link href="/"><Button variant="ghost" size="sm" className="text-stone-500 hover:text-amber-900 text-xs md:text-sm">Exit Wizard</Button></Link>
        </div>
      </nav>

      <main className="flex-1 flex items-start justify-center py-10 px-4 md:px-6">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center">
            
            <div className="w-full md:w-64 shrink-0 relative md:sticky md:top-24 self-start">
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full -z-0 md:hidden"><div className="absolute top-0 left-0 h-full bg-amber-500/50 transition-all duration-500 ease-out rounded-full" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div></div>
                <div className="hidden md:block absolute left-[19px] top-0 bottom-0 w-1 bg-gray-200 rounded-full -z-0 h-full"><div className="absolute top-0 left-0 w-full bg-amber-500/50 transition-all duration-500 ease-out rounded-full" style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div></div>
                <div className="flex justify-between md:flex-col md:space-y-6 relative z-10">
                    {steps.map((step) => (
                    <div key={step.id} onClick={() => step.id <= currentStep ? jumpToStep(step.id) : null} className={`flex flex-col items-center md:flex-row md:items-center md:gap-4 cursor-pointer group ${step.id <= currentStep ? "text-amber-700 font-bold" : "text-gray-300 cursor-not-allowed"}`}>
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 text-xs md:text-sm font-bold transition-all duration-300 bg-white shrink-0 ${step.id <= currentStep ? "border-amber-600 bg-amber-900 text-white shadow-md scale-110" : "border-gray-200 text-gray-300 group-hover:border-amber-200"}`}>{step.id}</div>
                        <span className="text-[10px] md:text-sm mt-2 md:mt-0 font-medium tracking-wide uppercase hidden sm:block md:block md:text-left">{step.name}</span>
                    </div>
                    ))}
                </div>
            </div>

            <Card className="flex-1 w-full max-w-2xl shadow-xl bg-white border-t-4 border-amber-900 rounded-xl overflow-hidden">
                <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-6 text-center md:text-left">
                    <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-serif text-amber-950">{steps[currentStep - 1].title}</CardTitle>
                        <CardDescription className="text-stone-500 text-xs md:text-sm">Please provide accurate information for your yearbook entry.</CardDescription>
                    </div>
                    {currentStep === 2 && (
                        <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}<span>{isOnline ? "Live Data" : "Offline"}</span>
                        </div>
                    )}
                    </div>
                </CardHeader>

                <CardContent className="min-h-[400px] pt-6">
                    <motion.div key={currentStep} initial={{ x: direction * 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction * -50, opacity: 0 }} transition={{ duration: 0.2 }}>
                    
                    {/* SOLID PRINCIPLE IN ACTION: Passing Props to Child Components */}
                    {currentStep === 1 && <PersonalStep idNumber={idNumber} setIdNumber={setIdNumber} lname={lname} setLname={setLname} fname={fname} setFname={setFname} mname={mname} setMname={setMname} suffix={suffix} setSuffix={setSuffix} nickname={nickname} setNickname={setNickname} bdate={bdate} setBdate={setBdate} />}
                    {currentStep === 2 && <AddressStep isLoadingProvinces={isLoadingProvinces} provinceList={provinceList} selectedProvinceCode={selectedProvinceCode} handleProvinceChange={handleProvinceChange} isLoadingCities={isLoadingCities} cityList={cityList} selectedCityCode={selectedCityCode} handleCityChange={handleCityChange} isLoadingBarangays={isLoadingBarangays} barangayList={barangayList} selectedBarangayCode={selectedBarangayCode} setSelectedBarangayCode={setSelectedBarangayCode} />}
                    {currentStep === 3 && <AcademicStep selectedDepartment={selectedDepartment} handleDepartmentChange={handleDepartmentChange} selectedCourse={selectedCourse} handleCourseChange={handleCourseChange} currentCourses={currentCourses} selectedMajor={selectedMajor} setSelectedMajor={setSelectedMajor} currentMajors={currentMajors} thesisTitle={thesisTitle} setThesisTitle={setThesisTitle} contactNum={contactNum} setContactNum={setContactNum} email={email} setEmail={setEmail} umEmail={umEmail} setUmEmail={setUmEmail} hasUmEmailAccess={hasUmEmailAccess} setHasUmEmailAccess={setHasUmEmailAccess} />}
                    
                    {/* FIXED: Nabutang na ang FamilyStep (Step 4) */}
                    {currentStep === 4 && <FamilyStep useGuardian={useGuardian} setUseGuardian={setUseGuardian} guardianLname={guardianLname} setGuardianLname={setGuardianLname} guardianTitle={guardianTitle} setGuardianTitle={setGuardianTitle} guardianFname={guardianFname} setGuardianFname={setGuardianFname} guardianRel={guardianRel} setGuardianRel={setGuardianRel} fatherLname={fatherLname} setFatherLname={setFatherLname} fatherTitle={fatherTitle} setFatherTitle={setFatherTitle} fatherFname={fatherFname} setFatherFname={setFatherFname} fatherMname={fatherMname} setFatherMname={setFatherMname} fatherSuffix={fatherSuffix} setFatherSuffix={setFatherSuffix} motherLname={motherLname} setMotherLname={setMotherLname} motherTitle={motherTitle} setMotherTitle={setMotherTitle} motherFname={motherFname} setMotherFname={setMotherFname} motherMname={motherMname} setMotherMname={setMotherMname} />}
                    
                    {currentStep === 5 && <ReviewStep idNumber={idNumber} fname={fname} mname={mname} lname={lname} suffix={suffix} nickname={nickname} formattedBirthdate={formattedBirthdate} barangayName={barangayName} cityName={cityName} provinceName={provinceName} selectedDepartment={selectedDepartment} selectedCourse={selectedCourse} selectedMajor={selectedMajor} thesisTitle={thesisTitle} umEmail={hasUmEmailAccess ? umEmail : "N/A (No Access)"} contactNum={contactNum} email={email} useGuardian={useGuardian} guardianTitle={guardianTitle} guardianFname={guardianFname} guardianLname={guardianLname} guardianRel={guardianRel} fatherTitle={fatherTitle} fatherFname={fatherFname} fatherMname={fatherMname} fatherLname={fatherLname} fatherSuffix={fatherSuffix} motherTitle={motherTitle} motherFname={motherFname} motherMname={motherMname} motherLname={motherLname} reviewConfirmed={reviewConfirmed} setReviewConfirmed={setReviewConfirmed} />}
                    {currentStep === 6 && <PrivacyStep privacyAgreed={privacyAgreed} setPrivacyAgreed={setPrivacyAgreed} />}
                    
                    </motion.div>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-stone-100 bg-stone-50/50 p-6">
                    {currentStep > 1 ? (
                        <Button variant="ghost" onClick={handleBack} className="text-stone-500 hover:text-stone-800">Previous</Button>
                    ) : (<div className="w-20"></div>)}
                    <Button className={`min-w-[140px] shadow-lg ${isStepValid() ? "bg-amber-900 hover:bg-amber-800 text-white shadow-amber-900/20" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`} onClick={currentStep === 6 ? onSubmit : handleNext} disabled={!isStepValid()}>
                    {currentStep === 6 ? "Submit Registration" : "Next Step"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-xs text-stone-400"><p>© 2026 AURIUM Yearbook Committee.</p></div>
      </footer>
    </div>
  );
}