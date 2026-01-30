"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { UserCircle, ClipboardCheck, MapPin, GraduationCap, Users, Mail, Phone, Calendar, Wifi, WifiOff, Loader2, CreditCard, Building2 } from "lucide-react";

// --- 2. CONFIGURATION DATA ---
const titleOptions = ["Mr.", "Mrs.", "Ms.", "Dr.", "Atty.", "Engr.", "Arch.", "Prof.", "Rev."];

// NEW DATA STRUCTURE: Department -> Course -> Major
const departmentOptions = [
  {
    name: "GRADUATE SCHOOL",
    courses: [
      { 
        name: "MASTER OF ARTS IN EDUCATION (MAED)", 
        majors: ["EDUCATIONAL MANAGEMENT", "GUIDANCE & COUNSELING", "PHYSICAL EDUCATION", "TEACHING ENGLISH", "TEACHING MATHEMATICS", "TEACHING SCIENCE"] 
      },
      { name: "MASTER IN BUSINESS ADMINISTRATION", majors: [] },
      { name: "MASTER IN MANAGEMENT", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ENGINEERING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ELECTRONICS ENGINEERING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ART AND SCIENCES EDUCATION",
    courses: [
      { name: "BACHELOR OF ARTS IN ENGLISH", majors: [] },
      { name: "BACHELOR OF SCIENCE IN PSYCHOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF ACCOUNTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN ACCOUNTANCY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY", majors: [] },
      { name: "BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF TEACHER EDUCATION",
    courses: [
      { name: "BACHELOR OF ELEMENTARY EDUCATION (GENERALIST)", majors: [] },
      { name: "BACHELOR OF PHYSICAL EDUCATION", majors: [] },
      { 
        name: "BACHELOR OF SECONDARY EDUCATION", 
        majors: ["ENGLISH", "FILIPINO", "MATHEMATICS", "SCIENCE", "SOCIAL STUDIES"] 
      }
    ]
  },
  {
    name: "DEPARTMENT OF BUSINESS ADMINISTRATION EDUCATION",
    courses: [
      { 
        name: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION", 
        majors: ["FINANCIAL MANAGEMENT", "HUMAN RESOURCE MANAGEMENT", "MARKETING MANAGEMENT"] 
      },
      { 
        name: "BACHELOR OF SCIENCE IN COMMERCE", 
        majors: ["MANAGEMENT"] 
      }
    ]
  },
  {
    name: "HOSPITALITY AND TOURISM MANAGEMENT EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT", majors: [] },
      { name: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT", majors: [] },
      { name: "BACHELOR OF ARTS IN ECONOMICS", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF CRIMINAL JUSTICE EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN CRIMINOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF COMPUTING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE", majors: [] },
      { name: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY", majors: [] }
    ]
  },
  {
    name: "DEPARTMENT OF NURSING EDUCATION",
    courses: [
      { name: "BACHELOR OF SCIENCE IN NURSING", majors: [] }
    ]
  }
];

const steps = [
  { id: 1, name: "Personal", title: "Personal Information" },
  { id: 2, name: "Address", title: "Home Address" },
  { id: 3, name: "Academic", title: "Academic & Contact" },
  { id: 4, name: "Family", title: "Parents or Guardian" },
  { id: 5, name: "Photo", title: "Upload Formal Photo" },
  { id: 6, name: "Review", title: "Review Details" }, 
  { id: 7, name: "Privacy", title: "Data Privacy" },
];

// Title Case function
const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export default function RegistrationWizard() {
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

  // --- SORTING FUNCTION (Keeps Davao on Top) ---
  const sortProvinces = (data: any[]) => {
    const priorityNames = [
      "Davao de Oro", 
      "Davao del Norte", 
      "Davao del Sur", 
      "Davao Occidental", 
      "Davao Oriental"
    ];
    
    const normalizedData = data.map(p => {
        let name = p.name;
        if (name === "Compostela Valley") name = "Davao de Oro"; 
        return { ...p, name };
    });

    const priorityProvinces = normalizedData.filter(p => priorityNames.includes(p.name));
    priorityProvinces.sort((a, b) => priorityNames.indexOf(a.name) - priorityNames.indexOf(b.name));

    const otherProvinces = normalizedData.filter(p => !priorityNames.includes(p.name));
    otherProvinces.sort((a, b) => a.name.localeCompare(b.name));

    return [...priorityProvinces, ...otherProvinces];
  };

  // --- 1. FETCH PROVINCES (API Only) ---
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
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // --- 2. FETCH CITIES (API Only) ---
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCityList([]);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const res = await fetch(`https://psgc.cloud/api/provinces/${selectedProvinceCode}/cities-municipalities`);
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        const sortedData = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCityList(sortedData);
        setIsOnline(true);
      } catch (err) {
        console.error("Failed to load cities:", err);
        setIsOnline(false);
        setCityList([]);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedProvinceCode]);

  // --- 3. FETCH BARANGAYS (API Only) ---
  useEffect(() => {
    if (!selectedCityCode) {
      setBarangayList([]);
      return;
    }

    const fetchBarangays = async () => {
      setIsLoadingBarangays(true);
      try {
        const res = await fetch(`https://psgc.cloud/api/cities-municipalities/${selectedCityCode}/barangays`);
        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        const sortedData = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setBarangayList(sortedData);
        setIsOnline(true);
      } catch (err) {
        console.error("Failed to load barangays:", err);
        setIsOnline(false);
        setBarangayList([]);
      } finally {
        setIsLoadingBarangays(false);
      }
    };
    fetchBarangays();
  }, [selectedCityCode]);

  const handleProvinceChange = (code: string) => {
    setSelectedProvinceCode(code);
    setSelectedCityCode("");
    setSelectedBarangayCode("");
  };

  const handleCityChange = (code: string) => {
    setSelectedCityCode(code);
    setSelectedBarangayCode("");
  };

  // --- STATE: Academic & Other ---
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [thesisTitle, setThesisTitle] = useState(""); 
  const [contactNum, setContactNum] = useState("");
  const [email, setEmail] = useState("");
  const [umEmail, setUmEmail] = useState(""); 

  // --- STATE: Family ---
  const [useGuardian, setUseGuardian] = useState(false);
  
  // Father
  const [fatherTitle, setFatherTitle] = useState("Mr.");
  const [fatherFname, setFatherFname] = useState("");
  const [fatherLname, setFatherLname] = useState("");
  const [fatherMname, setFatherMname] = useState("");
  const [fatherSuffix, setFatherSuffix] = useState("");

  // Mother
  const [motherTitle, setMotherTitle] = useState("Mrs.");
  const [motherFname, setMotherFname] = useState("");
  const [motherLname, setMotherLname] = useState("");
  const [motherMname, setMotherMname] = useState("");

  // Guardian
  const [guardianTitle, setGuardianTitle] = useState("Mrs.");
  const [guardianFname, setGuardianFname] = useState("");
  const [guardianLname, setGuardianLname] = useState("");
  const [guardianRel, setGuardianRel] = useState("");

  // --- STATE: Photo & Privacy ---
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  // --- DERIVED ACADEMIC OPTIONS ---
  const currentCourses = useMemo(() => {
    return departmentOptions.find(d => d.name === selectedDepartment)?.courses || [];
  }, [selectedDepartment]);

  const currentMajors = useMemo(() => {
    return currentCourses.find(c => c.name === selectedCourse)?.majors || [];
  }, [selectedCourse, currentCourses]);

  // --- HANDLERS ---
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedCourse(""); // Reset course
    setSelectedMajor("");  // Reset major
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
    const courseData = currentCourses.find(c => c.name === value);
    if (courseData && courseData.majors.length === 0) {
      setSelectedMajor("N/A");
    } else {
      setSelectedMajor("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // --- VALIDATION ---
  const isStepValid = () => {
    switch (currentStep) {
      case 1: 
        return idNumber.trim() !== "" && lname.trim() !== "" && fname.trim() !== "" && bdate !== "";
      case 2: 
        return selectedProvinceCode !== "" && selectedCityCode !== "" && selectedBarangayCode !== "";
      case 3: 
        // Added validation for selectedDepartment
        return selectedDepartment !== "" && selectedCourse !== "" && selectedMajor !== "" && thesisTitle.trim() !== "" && contactNum.trim() !== "" && email.trim() !== "" && umEmail.trim() !== "";
      case 4: 
        if (useGuardian) {
           return guardianLname.trim() !== "" && guardianFname.trim() !== "" && guardianRel.trim() !== "";
        } else {
           return (fatherLname.trim() !== "" && fatherFname.trim() !== "") && (motherLname.trim() !== "" && motherFname.trim() !== "");
        }
      case 5: 
        return photoPreview !== null;
      case 6: 
        return reviewConfirmed;
      case 7: 
        return privacyAgreed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length && isStepValid()) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (stepId: number) => {
    if (stepId < currentStep) {
       setDirection(-1);
       setCurrentStep(stepId);
    } 
  };

  const onSubmit = async () => {
    const relation: any = {};
    
    if (useGuardian) {
      relation.guardian = {
        first_name: guardianFname,
        last_name: guardianLname,
        relationship: guardianRel,
      }; 
    } else {
      relation.parent = {
        father: {
          first_name: fatherFname,
          last_name: fatherLname,
          middle_name: fatherMname,
          suffix: fatherSuffix,
        },
        mother: {
          first_name: motherFname,
          last_name: motherLname,
          middle_name: motherMname,
        },
      };
    }

    const body = {
      id: idNumber,
      personal_email: email,
      school_email: umEmail,
      last_name: lname,
      first_name: fname,
      middle_name: mname,
      suffix: suffix,
      nickname: nickname,
      birthdate: bdate,
      academics: {
        department: selectedDepartment, // Added Department
        course: selectedCourse,
        major: selectedMajor,
        thesis: thesisTitle,
      },
      ...relation, 
      province: provinceName,
      city: cityName,
      barangay: barangayName 
    };

    try {
      const res = await fetch("http://localhost:4000/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const json = await res.json();
      console.log(json);
    } catch (err) {
      console.error("Something went wrong..", err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      
      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-amber-100/50 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
                   <Image src="/images/umtc-logo.png" alt="UMTC Logo" fill className="object-contain"/>
                </div>
                <div className="h-6 w-[1px] bg-stone-300"></div>
                <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
                   <Image src="/images/aurium-logo.png" alt="Aurium Logo" fill className="object-contain"/>
                </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-xl font-serif font-bold text-amber-950 leading-none tracking-tight">AURIUM</span>
              <span className="text-[8px] md:text-[10px] text-amber-700 uppercase tracking-[0.1em] font-bold mt-0.5">Registration</span>
            </div>
          </Link>

          <Link href="/">
             <Button variant="ghost" size="sm" className="text-stone-500 hover:text-amber-900 text-xs md:text-sm">
               Exit Wizard
             </Button>
          </Link>
        </div>
      </nav>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="flex-1 flex items-start justify-center py-10 px-4 md:px-6">
        
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-12 items-start justify-center">
            
            {/* --- STEPS SIDEBAR / TOP BAR --- */}
            <div className="w-full md:w-64 shrink-0 relative md:sticky md:top-24 self-start">
                {/* Horizontal Bar (Mobile Only) */}
                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 rounded-full -z-0 md:hidden">
                    <div 
                    className="absolute top-0 left-0 h-full bg-amber-500/50 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Vertical Bar (Desktop Only) */}
                <div className="hidden md:block absolute left-[19px] top-0 bottom-0 w-1 bg-gray-200 rounded-full -z-0 h-full">
                    <div 
                        className="absolute top-0 left-0 w-full bg-amber-500/50 transition-all duration-500 ease-out rounded-full"
                        style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>

                {/* Steps Loop */}
                <div className="flex justify-between md:flex-col md:space-y-6 relative z-10">
                    {steps.map((step) => (
                    <div
                        key={step.id}
                        onClick={() => step.id <= currentStep ? jumpToStep(step.id) : null}
                        className={`flex flex-col items-center md:flex-row md:items-center md:gap-4 cursor-pointer group ${
                        step.id <= currentStep ? "text-amber-700 font-bold" : "text-gray-300 cursor-not-allowed"
                        }`}
                    >
                        <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 text-xs md:text-sm font-bold transition-all duration-300 bg-white shrink-0
                        ${
                            step.id <= currentStep
                            ? "border-amber-600 bg-amber-900 text-white shadow-md scale-110"
                            : "border-gray-200 text-gray-300 group-hover:border-amber-200"
                        }`}
                        >
                        {step.id}
                        </div>
                        <span className="text-[10px] md:text-sm mt-2 md:mt-0 font-medium tracking-wide uppercase hidden sm:block md:block md:text-left">
                            {step.name}
                        </span>
                    </div>
                    ))}
                </div>
            </div>

            {/* --- FORM CARD (Right Side on Desktop) --- */}
            <Card className="flex-1 w-full max-w-2xl shadow-xl bg-white border-t-4 border-amber-900 rounded-xl overflow-hidden">
                <CardHeader className="bg-stone-50/50 border-b border-stone-100 pb-6 text-center md:text-left">
                    <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-serif text-amber-950">
                            {steps[currentStep - 1].title}
                        </CardTitle>
                        <CardDescription className="text-stone-500 text-xs md:text-sm">
                            Please provide accurate information for your yearbook entry.
                        </CardDescription>
                    </div>
                    {/* Online Status Indicator */}
                    {currentStep === 2 && (
                        <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full ${isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                            <span>{isOnline ? "Live Data" : "Offline"}</span>
                        </div>
                    )}
                    </div>
                </CardHeader>

                <CardContent className="min-h-[400px] pt-6">
                    <motion.div
                    key={currentStep}
                    initial={{ x: direction * 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * -50, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    >
                    {/* --- STEP 1: PERSONAL --- */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="idNumber">Student ID Number <span className="text-red-500">*</span></Label>
                            <Input 
                                id="idNumber" 
                                value={idNumber} 
                                onChange={e => setIdNumber(e.target.value)} 
                                placeholder="e.g. 142478" 
                                className="h-11 font-mono text-amber-900 font-medium bg-amber-50/30 border-amber-200" 
                            />
                        </div>

                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>
                                <Input id="lname" value={lname} onChange={e => setLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
                                <Input id="fname" value={fname} onChange={e => setFname(toTitleCase(e.target.value))} placeholder="Juan" className="h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mname">Middle Name</Label>
                                <Input id="mname" value={mname} onChange={e => setMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Input id="suffix" value={suffix} onChange={e => setSuffix(e.target.value)} placeholder="Jr., III (Optional)" className="h-11" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Nickname (for Yearbook)</Label>
                            <Input 
                                id="nickname" 
                                value={nickname} 
                                onChange={(e) => setNickname(e.target.value)} 
                                placeholder="Juanny" 
                                className="h-11" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bdate">Birthdate <span className="text-red-500">*</span></Label>
                            <Input id="bdate" type="date" value={bdate} onChange={e => setBdate(e.target.value)} className="block w-full h-11" />
                        </div>
                        </div>
                    )}

                    {/* --- STEP 2: ADDRESS (API ONLY) --- */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Province <span className="text-red-500">*</span> {isLoadingProvinces && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing data...)</span>}</Label>
                            <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
                                <SelectTrigger className="h-11">
                                <SelectValue placeholder={isLoadingProvinces ? "Loading..." : "Select Province"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                {provinceList.map((prov) => (
                                    <SelectItem key={prov.code} value={String(prov.code)}>
                                    {prov.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Municipality / City <span className="text-red-500">*</span> {isLoadingCities && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing...)</span>}</Label>
                            <Select 
                                value={selectedCityCode} 
                                onValueChange={handleCityChange}
                                disabled={!selectedProvinceCode}
                            >
                                <SelectTrigger className={`h-11 ${!selectedProvinceCode ? "bg-gray-100" : ""}`}>
                                <SelectValue placeholder={isLoadingCities ? "Loading..." : "Select Municipality/City"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                {cityList.map((city) => (
                                    <SelectItem key={city.code} value={String(city.code)}>
                                    {city.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Barangay <span className="text-red-500">*</span> {isLoadingBarangays && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing...)</span>}</Label>
                            <Select 
                                value={selectedBarangayCode} 
                                onValueChange={setSelectedBarangayCode}
                                disabled={!selectedCityCode}
                            >
                                <SelectTrigger className={`h-11 ${!selectedCityCode ? "bg-gray-100" : ""}`}>
                                <SelectValue placeholder={isLoadingBarangays ? "Loading..." : "Select Barangay"} />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                {barangayList.map((brgy) => (
                                    <SelectItem key={brgy.code} value={String(brgy.code)}>
                                    {brgy.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                    )}

                    {/* --- STEP 3: ACADEMIC --- */}
                    {currentStep === 3 && (
                        <div className="space-y-5">
                        
                        {/* 1. Department Selection */}
                        <div className="space-y-2">
                            <Label>Department / School <span className="text-red-500">*</span></Label>
                            <Select onValueChange={handleDepartmentChange} value={selectedDepartment}>
                            <SelectTrigger className="w-full h-auto min-h-[50px] py-3 text-left flex items-center">
                                <span className="whitespace-normal leading-tight block text-left w-full">
                                <SelectValue placeholder="Select Department" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] max-w-[90vw] md:max-w-[500px]">
                                {departmentOptions.map((dept) => (
                                <SelectItem 
                                    key={dept.name} 
                                    value={dept.name}
                                    className="py-3 border-b last:border-0 whitespace-normal text-left font-semibold"
                                >
                                    {dept.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        {/* 2. Course Selection (Filtered by Department) */}
                        <div className="space-y-2">
                            <Label>Program / Course <span className="text-red-500">*</span></Label>
                            <Select 
                                onValueChange={handleCourseChange} 
                                value={selectedCourse}
                                disabled={!selectedDepartment} // Disable if no department selected
                            >
                            <SelectTrigger className={`w-full h-auto min-h-[50px] py-3 text-left flex items-center ${!selectedDepartment ? "bg-gray-100 text-gray-500" : ""}`}>
                                <span className="whitespace-normal leading-tight block text-left w-full">
                                <SelectValue placeholder={!selectedDepartment ? "Select Department First" : "Select Course"} />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] max-w-[90vw] md:max-w-[500px]">
                                {currentCourses.map((opt) => (
                                <SelectItem 
                                    key={opt.name} 
                                    value={opt.name}
                                    className="py-3 border-b last:border-0 whitespace-normal text-left"
                                >
                                    {opt.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>

                        {/* 3. Major Selection (Filtered by Course) */}
                        <div className="space-y-2">
                            <Label>Major / Specialization <span className="text-red-500">*</span></Label>
                            <Select 
                                value={selectedMajor} 
                                onValueChange={setSelectedMajor}
                                disabled={!selectedCourse || selectedMajor === "N/A"}
                            >
                                <SelectTrigger 
                                className={`w-full h-auto min-h-[50px] py-3 text-left items-center ${selectedMajor === "N/A" ? "bg-gray-100 text-gray-500" : ""}`}
                                >
                                <span className="whitespace-normal leading-tight block text-left w-full">
                                    <SelectValue placeholder={selectedMajor === "N/A" ? "N/A (Not Applicable)" : "Select Major"} />
                                </span>
                                </SelectTrigger>
                                <SelectContent className="max-w-[90vw]">
                                {selectedMajor === "N/A" ? (
                                    <SelectItem value="N/A">N/A</SelectItem>
                                ) : (
                                    currentMajors.map((major) => (
                                    <SelectItem key={major} value={major} className="py-2 whitespace-normal text-left">
                                        {major}
                                    </SelectItem>
                                    ))
                                )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* --- ADDED THESIS TITLE FIELD --- */}
                        <div className="space-y-2">
                            <Label>Thesis / Capstone Title <span className="text-red-500">*</span></Label>
                            <Input 
                                value={thesisTitle} 
                                onChange={e => setThesisTitle(e.target.value)} 
                                placeholder="Enter complete title of your Thesis or Capstone Project" 
                                className="h-11" 
                            />
                        </div>

                        <div className="h-px bg-gray-200 my-2"></div>

                        <div className="space-y-2">
                            <Label>Primary Contact Number <span className="text-red-500">*</span></Label>
                            <Input value={contactNum} onChange={e => setContactNum(e.target.value)} placeholder="09XXXXXXXXX" inputMode="numeric" className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>Personal Email Address <span className="text-red-500">*</span></Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label>UM Student Email <span className="text-red-500">*</span></Label>
                            <Input type="email" value={umEmail} onChange={e => setUmEmail(e.target.value)} placeholder="IDNUMBER.tc@umindanao.edu.ph" className="h-11" />
                        </div>
                        </div>
                    )}

                    {/* --- STEP 4: FAMILY --- */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                        <div className="flex items-center space-x-2 bg-amber-50 p-4 rounded-lg border border-amber-100">
                            <Checkbox 
                            id="guardian-mode" 
                            checked={useGuardian}
                            onCheckedChange={(checked) => setUseGuardian(checked as boolean)}
                            />
                            <Label htmlFor="guardian-mode" className="cursor-pointer text-amber-900 font-medium">
                            I live with a Guardian (Not Parents)
                            </Label>
                        </div>

                        {!useGuardian ? (
                            <>
                            {/* FATHER */}
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4 border-b border-gray-100">
                                <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Father's Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Last Name <span className="text-red-500">*</span></Label>
                                        <Input value={fatherLname} onChange={e => setFatherLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>First Name <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            <Select value={fatherTitle} onValueChange={setFatherTitle}>
                                                <SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Input value={fatherFname} onChange={e => setFatherFname(toTitleCase(e.target.value))} placeholder="Juan" className="flex-1 h-10"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Middle Name</Label>
                                        <Input value={fatherMname} onChange={e => setFatherMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-10" />
                                    </div>
                                    <div className="space-y-2"><Label>Suffix</Label><Input value={fatherSuffix} onChange={e => setFatherSuffix(e.target.value)} placeholder="Jr." className="h-10" /></div>
                                </div>
                            </div>

                            {/* MOTHER */}
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Mother's Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Last Name <span className="text-red-500">*</span></Label>
                                        <Input value={motherLname} onChange={e => setMotherLname(toTitleCase(e.target.value))} placeholder="Dela Cruz" className="h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>First Name <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            <Select value={motherTitle} onValueChange={setMotherTitle}>
                                                <SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger>
                                                <SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Input value={motherFname} onChange={e => setMotherFname(toTitleCase(e.target.value))} placeholder="Maria" className="flex-1 h-10"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Middle Name</Label>
                                        <Input value={motherMname} onChange={e => setMotherMname(toTitleCase(e.target.value))} placeholder="Santos" className="h-10" />
                                    </div>
                                </div>
                            </div>
                            </>
                        ) : (
                            /* GUARDIAN */
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wide">Guardian's Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label>
                                    <Input value={guardianLname} onChange={e => setGuardianLname(toTitleCase(e.target.value))} placeholder="Last Name" className="h-10" />
                                    </div>
                                    <div className="space-y-2">
                                    <Label>First Name <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                            <Select value={guardianTitle} onValueChange={setGuardianTitle}>
                                            <SelectTrigger className="w-[80px] shrink-0 h-10"><SelectValue /></SelectTrigger>
                                            <SelectContent>{titleOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Input value={guardianFname} onChange={e => setGuardianFname(toTitleCase(e.target.value))} placeholder="First Name" className="flex-1 h-10"/>
                                    </div>
                                    </div>
                                </div>
                                <div className="space-y-2"><Label>Relationship <span className="text-red-500">*</span></Label>
                                    <Input value={guardianRel} onChange={e => setGuardianRel(toTitleCase(e.target.value))} placeholder="e.g. Grandmother" className="h-10" />
                                </div>
                            </div>
                        )}
                        </div>
                    )}

                    {/* --- STEP 5: PHOTO --- */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <div 
                            onClick={triggerFileInput}
                            className="flex flex-col items-center justify-center py-10 space-y-4 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer min-h-[300px]"
                        >
                            {photoPreview ? (
                                <div className="relative group">
                                <img 
                                    src={photoPreview} 
                                    alt="Preview" 
                                    className="w-48 h-48 object-cover rounded-md border-4 border-white shadow-xl rotate-1 group-hover:rotate-0 transition-transform duration-300" 
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-md transition-opacity text-white text-sm font-bold">
                                    Change Image
                                </div>
                                </div>
                            ) : (
                                <>
                                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 mb-2">
                                    <UserCircle size={64} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-serif text-amber-900">Upload Formal Photo</p>
                                    <p className="text-sm text-stone-500 mt-1">JPG or PNG, max 5MB</p>
                                </div>
                                </>
                            )}
                            <Button variant="outline" className="mt-4 pointer-events-none border-amber-200 text-amber-900">
                                {photoPreview ? "Replace Photo" : "Select from Device"}
                            </Button>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 flex gap-3">
                            <div className="mt-0.5">ℹ️</div>
                            <div>
                                <strong>Requirements:</strong>
                                <ul className="list-disc pl-4 mt-1 space-y-1 text-blue-700/80">
                                <li>Plain or solid background color</li>
                                <li>Wear formal business attire</li>
                                <li>High resolution (not blurry)</li>
                                </ul>
                            </div>
                        </div>
                        </div>
                    )}

                    {/* --- STEP 6: REVIEW --- */}
                    {currentStep === 6 && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200">
                            <div className="bg-amber-100 p-2.5 rounded-full">
                                <ClipboardCheck className="text-amber-800 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-amber-900 text-xl">Review Registration</h3>
                                <p className="text-stone-500 text-xs">Please verify your information before submitting.</p>
                            </div>
                            </div>
                            
                            <div className="space-y-8">
                            {/* REVIEW CONTENT */}
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider">
                                <UserCircle size={16} /> Personal Identity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 bg-white p-4 rounded-lg border border-stone-100 shadow-sm">
                                {/* --- NEW ID NUMBER REVIEW --- */}
                                <div className="md:col-span-2 pb-2 border-b border-stone-50 mb-2">
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Student ID Number</span>
                                    <div className="flex items-center gap-2 text-amber-800 font-mono font-bold text-lg">
                                        <CreditCard size={16}/> {idNumber || "-"}
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Full Name</span>
                                    <span className="text-stone-900 font-semibold text-lg">{fname} {mname} {lname} {suffix}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Nickname</span>
                                    {/* FIX: Add Quotes here in Step 6 Review */}
                                    <span className="text-stone-900 font-medium">{nickname ? `"${nickname}"` : "-"}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Birthdate</span>
                                    <div className="flex items-center gap-2 text-stone-900 font-medium">
                                        <Calendar size={14} className="text-amber-600"/> {formattedBirthdate || "-"}
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider">
                                <MapPin size={16} /> Residence
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm">
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Home Address</span>
                                    <span className="text-stone-900 font-medium">{barangayName}, {cityName}, {provinceName}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider">
                                <GraduationCap size={16} /> Academic Profile
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm space-y-4">
                                <div>
                                    {/* ADDED DEPARTMENT REVIEW */}
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Department</span>
                                    <span className="text-stone-900 font-bold block mb-2">{selectedDepartment}</span>

                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Course & Major</span>
                                    <span className="text-stone-900 font-bold block">{selectedCourse}</span>
                                    {selectedMajor !== "N/A" && <span className="text-amber-700 text-sm font-medium block mt-1">{selectedMajor}</span>}
                                </div>
                                <div className="pt-2 border-t border-stone-100 mt-2">
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Thesis / Capstone Title</span>
                                    <span className="text-stone-900 font-medium italic">"{thesisTitle}"</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                                    <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">UM Student Email</span>
                                    <div className="flex items-center gap-2 text-blue-700 font-medium break-all">
                                        <Mail size={14}/> {umEmail || "-"}
                                    </div>
                                    </div>
                                    <div>
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Contact Number</span>
                                    <div className="flex items-center gap-2 text-stone-900 font-medium">
                                        <Phone size={14} className="text-amber-600"/> {contactNum || "-"}
                                    </div>
                                    </div>
                                    <div className="md:col-span-2">
                                    <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Personal Email</span>
                                    <span className="text-stone-700 font-medium">{email || "-"}</span>
                                    </div>
                                </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider">
                                <Users size={16} /> Family Background
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm">
                                {useGuardian ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Guardian</span>
                                            <span className="text-stone-900 font-medium">{guardianTitle} {guardianFname} {guardianLname}</span>
                                            <span className="text-stone-400 text-xs ml-2">({guardianRel})</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Father</span>
                                            <span className="text-stone-900 font-medium">{fatherTitle} {fatherFname} {fatherMname} {fatherLname} {fatherSuffix}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] uppercase tracking-wider text-stone-500 font-bold mb-1">Mother</span>
                                            <span className="text-stone-900 font-medium">{motherTitle} {motherFname} {motherMname} {motherLname}</span>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-amber-900 uppercase tracking-wider">
                                Attached Photo
                                </h4>
                                <div className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm flex items-center justify-between">
                                    {photoPreview ? (
                                    <div className="flex items-center gap-4">
                                        <img src={photoPreview} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-sm" />
                                        <div>
                                        <span className="text-green-700 font-bold text-sm block mb-1">Photo Attached Successfully</span>
                                        <span className="text-stone-400 text-xs">Ready for submission</span>
                                        </div>
                                    </div>
                                    ) : (
                                    <span className="text-red-500 text-sm font-medium flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div> No photo uploaded
                                    </span>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => jumpToStep(5)} className="text-amber-700 hover:text-amber-900 text-xs">
                                    Edit
                                    </Button>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 border border-stone-200 bg-amber-50/30 rounded-lg">
                            <Checkbox 
                                id="confirm-review" 
                                className="mt-1 border-amber-400 text-amber-700 focus:ring-amber-700" 
                                checked={reviewConfirmed}
                                onCheckedChange={(checked) => setReviewConfirmed(checked as boolean)}
                            />
                            <Label htmlFor="confirm-review" className="text-sm font-medium leading-snug cursor-pointer text-stone-700">
                                I hereby confirm that the details shown above are true, correct, and free from errors.
                            </Label>
                        </div>
                        </div>
                    )}

                    {/* --- STEP 7: PRIVACY --- */}
                    {currentStep === 7 && (
                        <div className="space-y-4">
                        <div className="p-5 bg-stone-50 border border-stone-200 rounded-lg h-72 overflow-y-auto text-sm text-stone-600 leading-relaxed text-justify pr-2">
                            <h4 className="font-bold text-amber-900 mb-3 text-base">Data Privacy Consent</h4>
                            <p className="mb-3">
                                In compliance with the <strong>Data Privacy Act of 2012 (R.A. 10173)</strong>, I hereby authorize the AURIUM Yearbook Committee of the University of Mindanao Tagum College to collect, process, and store the personal data indicated herein for the purpose of the yearbook publication.
                            </p>
                            <p className="mb-3">
                                I understand that my information will be used solely for:
                            </p>
                            <ul className="list-disc pl-5 mb-3 space-y-1">
                                <li>Verification of graduate status.</li>
                                <li>Layout and design of the yearbook pages.</li>
                                <li>Communication regarding yearbook distribution.</li>
                            </ul>
                            <p>
                                I attest that all information provided is true and correct.
                            </p>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
                            <Checkbox 
                                id="terms" 
                                className="mt-1" 
                                checked={privacyAgreed}
                                onCheckedChange={(checked) => setPrivacyAgreed(checked as boolean)}
                            />
                            <Label htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer text-amber-900">
                                I have read and understood the Data Privacy Statement and agree to the processing of my personal data.
                            </Label>
                        </div>
                        </div>
                    )}

                    </motion.div>
                </CardContent>

                <CardFooter className="flex justify-between border-t border-stone-100 bg-stone-50/50 p-6">
                    {currentStep > 1 ? (
                        <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="text-stone-500 hover:text-stone-800"
                        >
                        Previous
                        </Button>
                    ) : (
                        <div className="w-20"></div> // Placeholder to keep Next button on the right
                    )}
                    
                    <Button 
                    className={`min-w-[140px] shadow-lg ${isStepValid() ? "bg-amber-900 hover:bg-amber-800 text-white shadow-amber-900/20" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    onClick={currentStep === 7 ? onSubmit : handleNext}
                    disabled={!isStepValid()}
                    >
                    {currentStep === 7 ? "Submit Registration" : "Next Step"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200 py-8 mt-auto">
        <div className="container mx-auto px-6 text-center text-xs text-stone-400">
          <p>© 2026 AURIUM Yearbook Committee.</p>
        </div>
      </footer>
    </div>
  );
}
