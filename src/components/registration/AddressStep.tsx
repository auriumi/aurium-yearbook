import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to fix Mojibake (UTF-8 encoding issues like DoÃ±a to Doña)
const fixTextEncoding = (text: string) => {
    if (!text) return "";
    try {
        // This decodes wrongly encoded UTF-8 strings returned by older PHP/MySQL APIs
        return decodeURIComponent(escape(text));
    } catch (e) {
        return text; // Fallback if it fails to decode
    }
};

export const AddressStep = ({ isLoadingProvinces, provinceList, selectedProvinceCode, handleProvinceChange, isLoadingCities, cityList, selectedCityCode, handleCityChange, isLoadingBarangays, barangayList, selectedBarangayCode, setSelectedBarangayCode }: any) => (
  <div className="space-y-4">
    <div className="space-y-2">
        <Label>Province <span className="text-red-500">*</span> {isLoadingProvinces && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing data...)</span>}</Label>
        <Select value={selectedProvinceCode} onValueChange={handleProvinceChange}>
            <SelectTrigger className="h-11"><SelectValue placeholder={isLoadingProvinces ? "Loading..." : "Select Province"} /></SelectTrigger>
            <SelectContent className="max-h-[200px]">{provinceList.map((prov: any) => (<SelectItem key={prov.code} value={String(prov.code)}>{fixTextEncoding(prov.name)}</SelectItem>))}</SelectContent>
        </Select>
    </div>
    <div className="space-y-2">
        <Label>Municipality / City <span className="text-red-500">*</span> {isLoadingCities && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing...)</span>}</Label>
        <Select value={selectedCityCode} onValueChange={handleCityChange} disabled={!selectedProvinceCode}>
            <SelectTrigger className={`h-11 ${!selectedProvinceCode ? "bg-gray-100" : ""}`}><SelectValue placeholder={isLoadingCities ? "Loading..." : "Select Municipality/City"} /></SelectTrigger>
            <SelectContent className="max-h-[200px]">{cityList.map((city: any) => (<SelectItem key={city.code} value={String(city.code)}>{fixTextEncoding(city.name)}</SelectItem>))}</SelectContent>
        </Select>
    </div>
    <div className="space-y-2">
        <Label>Barangay <span className="text-red-500">*</span> {isLoadingBarangays && <span className="text-xs text-stone-400 font-normal ml-2">(Refreshing...)</span>}</Label>
        <Select value={selectedBarangayCode} onValueChange={setSelectedBarangayCode} disabled={!selectedCityCode}>
            <SelectTrigger className={`h-11 ${!selectedCityCode ? "bg-gray-100" : ""}`}><SelectValue placeholder={isLoadingBarangays ? "Loading..." : "Select Barangay"} /></SelectTrigger>
            <SelectContent className="max-h-[200px]">{barangayList.map((brgy: any) => (<SelectItem key={brgy.code} value={String(brgy.code)}>{fixTextEncoding(brgy.name)}</SelectItem>))}</SelectContent>
        </Select>
    </div>
  </div>
);