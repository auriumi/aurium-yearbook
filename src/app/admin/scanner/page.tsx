"use client";

import { ScanLine, CheckCircle, XCircle, Camera, CameraOff, Search, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scanner } from '@yudiel/react-qr-scanner';

// Import the hook that handles all scanner logic
import { useScanner } from "@/hooks/useScanner";

export default function ScannerPage() {
  
  // Destructure state and functions from the hook to keep the component clean
  const {
    scanInput, setScanInput,
    scanResult,
    scannedStudent,
    errorMessage,
    isCameraActive, setIsCameraActive,
    currentSessionKey, setCurrentSessionKey,
    selectedSession,
    filter, setFilter,
    displayedList,
    totalStudents,
    attendedCount,
    pendingCount,
    handleManualSubmit,
    handleQrScan,
    SESSION_OPTIONS
  } = useScanner();

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col lg:flex-row font-sans overflow-hidden">
      
      {/* LEFT: SCANNER AREA (60%) */}
      <div className="flex-1 flex flex-col relative border-r border-stone-800">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 w-full p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center z-20 gap-4 pointer-events-none">
            <div className="pointer-events-auto">
                <h1 className="text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2">
                    <ScanLine className="text-amber-500"/> Entrance Scanner
                </h1>
                <p className="text-stone-400 text-xs mt-1">AURIUM Event Management System</p>
            </div>
            
            {/* Session Selector */}
            <div className="w-full sm:w-64 pointer-events-auto">
                <Select value={currentSessionKey} onValueChange={setCurrentSessionKey}>
                    <SelectTrigger className="w-full bg-stone-900 border-stone-700 text-amber-400 font-bold">
                        <SelectValue placeholder="Select Session" />
                    </SelectTrigger>
                    <SelectContent className="bg-stone-900 border-stone-700 text-stone-200">
                        {SESSION_OPTIONS.map(opt => (
                            <SelectItem key={`${opt.date}-${opt.session}`} value={`${opt.date}-${opt.session}`}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {/* Scanner Content */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 relative pt-24">
            
            {/* Background color transition based on scan result */}
            <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none opacity-20
                ${scanResult === 'success' ? 'bg-green-500' : scanResult === 'error' ? 'bg-red-500' : 'bg-transparent'}`} 
            />

            <div className="z-10 w-full max-w-md space-y-6">
                
                {/* --- FUTURISTIC SCANNER CARD --- */}
                <div className="relative group">
                    <div className={`absolute -inset-1 rounded-xl opacity-75 blur transition duration-500 
                        ${scanResult === 'success' ? 'bg-green-500' : scanResult === 'error' ? 'bg-red-500' : 'bg-amber-500/20'}`}>
                    </div>
                    
                    <Card className={`relative border-0 shadow-2xl overflow-hidden bg-stone-900`}>
                        {/* Corner markers for aesthetic */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500/50 rounded-tl-lg z-20 animate-pulse"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500/50 rounded-tr-lg z-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500/50 rounded-bl-lg z-20 animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500/50 rounded-br-lg z-20 animate-pulse"></div>

                        {/* --- CAMERA AREA --- */}
                        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
                            
                            {isCameraActive ? (
                                <div className="absolute inset-0 z-0">
                                    <Scanner 
                                        onScan={handleQrScan}
                                        scanDelay={3000} 
                                        constraints={{ facingMode: 'environment' }}
                                        styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
                                    />
                                    {/* Scan Line Overlay */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
                                </div>
                            ) : (
                                <div className="text-stone-600 flex flex-col items-center">
                                    <CameraOff className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Camera Paused</p>
                                </div>
                            )}

                            {/* RESULT OVERLAYS */}
                            {scanResult === 'success' && scannedStudent && (
                                <div className="absolute inset-0 z-30 bg-stone-900/90 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 p-4 text-center">
                                    <Avatar className="w-24 h-24 border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)] mb-4">
                                        {/* FIXED: Added "as any" to bypass TypeScript error for photoUrl */}
                                        <AvatarImage src={(scannedStudent as any).photoUrl ?? undefined} className="object-cover" />
                                        {/* Dynamic fallback initial based on the student's name */}
                                        <AvatarFallback>{scannedStudent.name ? scannedStudent.name.charAt(0).toUpperCase() : "S"}</AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-3xl font-black text-green-400 tracking-widest drop-shadow-md">VERIFIED</h2>
                                    <p className="text-xl font-bold text-white mt-2 truncate max-w-full">{scannedStudent.name}</p>
                                    <p className="text-stone-400 font-mono text-lg">{scannedStudent.id}</p>
                                </div>
                            )}

                            {scanResult === 'error' && (
                                <div className="absolute inset-0 z-30 bg-stone-900/90 flex flex-col items-center justify-center animate-in zoom-in-95 duration-200 p-4 text-center">
                                    <XCircle className="w-24 h-24 text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.4)]" />
                                    <h2 className="text-3xl font-black text-red-500 tracking-widest">DENIED</h2>
                                    <p className="text-red-200 font-medium text-sm mt-2 bg-red-950/50 px-3 py-1 rounded">{errorMessage}</p>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="p-4 bg-stone-900 border-t border-stone-800 flex justify-between items-center z-20 relative">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className="text-xs text-stone-400 uppercase tracking-wider font-bold">
                                    {isCameraActive ? 'Camera Live' : 'Camera Off'}
                                </span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsCameraActive(!isCameraActive)}
                                className="h-8 w-8 p-0 text-stone-400 hover:text-white"
                            >
                                {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                            </Button>
                        </div>

                    </Card>
                </div>

                {/* Manual entry fallback in case the ID barcode/QR is damaged */}
                <form onSubmit={handleManualSubmit} className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-stone-500 group-focus-within:text-amber-500 transition-colors"/>
                    </div>
                    <Input 
                        placeholder="Manual Entry: Type ID & Enter..." 
                        className="bg-stone-900 border-stone-700 text-white h-14 pl-10 text-lg font-mono placeholder:text-stone-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all rounded-xl shadow-inner"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                    />
                    <Button type="submit" className="absolute right-2 top-2 bottom-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg">
                        Enter
                    </Button>
                </form>

            </div>
        </div>
      </div>

      {/* RIGHT: ATTENDANCE LIST (40%) */}
      <div className="w-full lg:w-[450px] bg-stone-900 flex flex-col border-l border-stone-800 shadow-2xl z-20">
        
        {/* Stats Header */}
        <div className="p-6 bg-stone-900 border-b border-stone-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-amber-500"/> Attendance: {selectedSession} Session
            </h3>
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-stone-800 p-3 rounded-lg border border-stone-700 text-center">
                    <p className="text-2xl font-bold text-white">{totalStudents}</p>
                    <p className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">Total</p>
                </div>
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-900/30 text-center">
                    <p className="text-2xl font-bold text-green-400">{attendedCount}</p>
                    <p className="text-[10px] uppercase text-green-600 font-bold tracking-wider">Attended</p>
                </div>
                <div className="bg-stone-800 p-3 rounded-lg border border-stone-700 text-center opacity-60">
                    <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
                    <p className="text-[10px] uppercase text-amber-600 font-bold tracking-wider">Pending</p>
                </div>
            </div>
        </div>

        {/* Filter Tabs - Updated to match the status variables */}
        <div className="px-6 pt-4">
            <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setFilter(val as any)}>
                <TabsList className="w-full bg-stone-800">
                    <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
                    <TabsTrigger value="attended" className="flex-1 text-xs text-green-400 data-[state=active]:bg-green-900/20">Attended</TabsTrigger>
                    <TabsTrigger value="pending" className="flex-1 text-xs text-amber-400 data-[state=active]:bg-amber-900/20">Pending</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>

        {/* Scrollable List */}
        <ScrollArea className="flex-1 p-6">
            <div className="space-y-2">
                {displayedList.map((student) => (
                    <div 
                        key={student.id} 
                        className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                        ${student.status === 'attended' 
                            ? 'bg-green-900/10 border-green-900/30' 
                            : 'bg-stone-900 border-stone-800 opacity-60 hover:opacity-100 hover:bg-stone-800'
                        }`}
                    >
                        <Avatar className={`h-10 w-10 border-2 ${student.status === 'attended' ? 'border-green-500' : 'border-stone-700'}`}>
                            {/* FIXED: Added "as any" to bypass TypeScript error for photoUrl */}
                            <AvatarImage src={(student as any).photoUrl ?? undefined} className="object-cover" />
                            {/* Dynamic fallback initial based on the student's name */}
                            <AvatarFallback className="bg-stone-800 text-stone-400">
                                {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate ${student.status === 'attended' ? 'text-white' : 'text-stone-400'}`}>
                                {student.name}
                            </p>
                            <p className="text-xs text-stone-500 font-mono truncate">{student.id}</p>
                        </div>

                        <div>
                            {student.status === 'attended' ? (
                                <div className="text-right">
                                    <Badge className="bg-green-600 hover:bg-green-600 text-[10px] px-2 h-5">Verified</Badge>
                                    <p className="text-[10px] text-green-400/70 font-mono mt-1">{student.timeIn}</p>
                                </div>
                            ) : (
                                <Badge variant="outline" className="border-amber-700/50 text-amber-500 text-[10px] px-2 h-5">
                                    Waiting
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}

                {displayedList.length === 0 && (
                    <div className="text-center py-12 text-stone-500 text-sm">
                        No students found for this filter.
                    </div>
                )}
            </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 text-center">
            <Button variant="ghost" className="w-full text-stone-500 hover:text-white hover:bg-stone-800 text-xs">
                Export Attendance Report
            </Button>
        </div>

      </div>
      
      {/* CSS Animation for Scan Line */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

    </div>
  );
}