"use client";

import { useState } from "react";
import { Users, Edit3, Save, Info, CheckCircle, Building2, User } from "lucide-react";
import toast from "react-hot-toast";

interface SolicitationWidgetProps {
  initialSponsors?: string[];
  onSave: (sponsors: string[]) => Promise<void>;
}

type SponsorType = "individual" | "company";

interface Sponsor {
  type: SponsorType;
  title: string;
  name: string;
}

const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Atty.", "Engr.", "Arch.", "Prof.", "Rev.", "Hon."];

export function SolicitationWidget({ initialSponsors = ["", "", "", ""], onSave }: SolicitationWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const parseInitialSponsors = (): Sponsor[] => {
    const defaultSponsors = initialSponsors.length === 4 ? initialSponsors : ["", "", "", ""];
    return defaultSponsors.map(val => {
      if (!val) return { type: "individual", title: "Mr.", name: "" };
      for (const t of TITLES) {
        if (val.startsWith(t + " ")) {
          return { type: "individual", title: t, name: val.substring(t.length + 1) };
        }
      }
      return { type: "company", title: "", name: val };
    });
  };

  const [sponsors, setSponsors] = useState<Sponsor[]>(parseInitialSponsors());

  const handleUpdate = (index: number, field: keyof Sponsor, value: string) => {
    const updated = [...sponsors];
    updated[index] = { ...updated[index], [field]: value };
    setSponsors(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formattedSponsors = sponsors.map(s => {
        if (!s.name.trim()) return "";
        if (s.type === "individual") return `${s.title} ${s.name.trim()}`;
        return s.name.trim();
      });
      await onSave(formattedSponsors);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save sponsors. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSponsors(parseInitialSponsors());
    setIsEditing(false);
  };

  const filledCount = sponsors.filter(s => s.name.trim() !== "").length;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2 text-stone-800">
          <Users className="text-amber-600" size={20} />
          <h2 className="font-bold text-lg">Solicitation Sponsors</h2>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md hover:bg-amber-100 transition-colors">
            <Edit3 size={14} /> Edit Names
          </button>
        ) : (
           <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{filledCount} / 4 Added</div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 space-y-3">
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-amber-50/80 border border-amber-100 rounded-lg p-3 flex gap-2 items-start mb-2">
              <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Choose the sponsor type. For individuals, <strong>select their appropriate title</strong> to ensure correct spelling in the yearbook.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sponsors.map((sponsor, index) => (
                <div key={index} className="p-3 bg-stone-50 border border-stone-100 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Sponsor {index + 1}</span>
                    <div className="flex bg-white border border-stone-200 rounded-md overflow-hidden">
                      <button onClick={() => handleUpdate(index, "type", "individual")} className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors ${sponsor.type === "individual" ? "bg-amber-100 text-amber-800" : "text-stone-500 hover:bg-stone-50"}`}>
                        <User size={12} /> Individual
                      </button>
                      <button onClick={() => handleUpdate(index, "type", "company")} className={`px-2 py-1 text-[10px] font-medium flex items-center gap-1 transition-colors border-l border-stone-200 ${sponsor.type === "company" ? "bg-amber-100 text-amber-800" : "text-stone-500 hover:bg-stone-50"}`}>
                        <Building2 size={12} /> Company
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {sponsor.type === "individual" && (
                      <select 
                        value={sponsor.title} 
                        onChange={(e) => handleUpdate(index, "title", e.target.value)}
                        className="h-10 px-2 text-sm border border-stone-200 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-white w-20 shrink-0"
                      >
                        {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                    <input
                      type="text"
                      placeholder={sponsor.type === "individual" ? "Full Name" : "Company or Org Name"}
                      value={sponsor.name}
                      onChange={(e) => handleUpdate(index, "name", e.target.value)}
                      className="flex-1 h-10 px-3 text-sm border border-stone-200 rounded-md focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-stone-300 w-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 mt-2">
              <button onClick={handleCancel} disabled={isSaving} className="flex-1 py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors shadow-sm">
                {isSaving ? "Saving..." : <><Save size={16}/> Save Names</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in duration-300">
            {filledCount === 0 ? (
              <div className="text-center py-6 text-stone-400">
                <p className="text-sm">No sponsors added yet.</p>
                <p className="text-xs mt-1">Click edit to add your 4 forms.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sponsors.map((sponsor, index) => (
                  sponsor.name.trim() !== "" && (
                    <li key={index} className="flex items-center gap-3 text-sm text-stone-700 bg-stone-50 px-3 py-2.5 rounded-md border border-stone-100">
                      <CheckCircle size={16} className="text-green-500 shrink-0" />
                      <span className="font-medium truncate">
                        {sponsor.type === "individual" ? `${sponsor.title} ${sponsor.name}` : sponsor.name}
                      </span>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}