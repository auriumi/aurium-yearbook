"use client";

import Link from "next/link";
import { UserCircle, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  fullName: string;
  idNumber: string;
  course: string;
  photoUrl: string | null;
}

export function ProfileCard({ fullName, idNumber, course, photoUrl }: ProfileCardProps) {
  return (
    <Card className="md:col-span-1 border-t-4 border-t-amber-900 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-stone-700">
          <UserCircle className="w-5 h-5 text-amber-700" /> Yearbook Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            {/* TODO: photo url */}
            <AvatarImage src={photoUrl ? photoUrl : undefined} className="object-cover" />
            <AvatarFallback className="text-4xl bg-stone-100 text-stone-300">JD</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border border-stone-100">
             <CheckCircle className="w-6 h-6 text-blue-500 fill-white" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-xl text-stone-800 font-serif">{fullName}</h3>
          <p className="text-sm font-medium text-amber-700 mt-1">{idNumber}</p>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed px-4">{course}</p>
        </div>

        <Link href="/student/dashboard/yearbook-preview" className="w-full">
          <Button variant="outline" className="w-full text-xs border-amber-200 text-amber-900 hover:bg-amber-50 hover:text-amber-900">
            <Info className="w-3 h-3 mr-2" /> Check Yearbook Entry
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}