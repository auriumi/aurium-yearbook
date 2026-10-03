'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function ReferencePhoto({ src, present, graduateName }: {
  src: string | null; present: boolean; graduateName: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const available = !!src && failedSrc !== src;
  const unavailable = present ? 'Reference photo unavailable' : 'No reference photo';
  return <Dialog>
    <DialogTrigger asChild>
      <button type="button" disabled={!available} aria-label={`Enlarge reference photo for ${graduateName}`}
        className="relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50 text-center text-xs text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">
        {available ? <><Image unoptimized width={96} height={128} src={src} alt={`Registration reference photo for ${graduateName}`}
          onError={() => setFailedSrc(src)} className="h-full w-full object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-stone-950/80 px-1 py-1 text-white">View larger</span></>
          : <span className="px-2">{unavailable}</span>}
      </button>
    </DialogTrigger>
    <DialogContent overlayClassName="bg-stone-950/85" className="flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-5xl">
      <DialogTitle>Reference photo</DialogTitle>
      <DialogDescription>{graduateName} · Registration photo · Read-only</DialogDescription>
      <div className="relative min-h-0 flex-1 rounded-lg bg-stone-100">
        {available ? <Image unoptimized fill sizes="(max-width: 1024px) 100vw, 1024px" src={src}
          alt={`Registration reference photo for ${graduateName}`} onError={() => setFailedSrc(src)} className="object-contain" />
          : <p role="status" className="p-5 text-sm text-stone-600">{unavailable}</p>}
      </div>
    </DialogContent>
  </Dialog>;
}
