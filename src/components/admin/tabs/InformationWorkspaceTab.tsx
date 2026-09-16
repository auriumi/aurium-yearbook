"use client";

import { GraduateInformationWorkspace } from '@/features/graduate-information/GraduateInformationWorkspace';
import { sampleInformationRows } from '@/features/graduate-information/sample-data';

export function InformationWorkspaceTab() {
  return <div className="space-y-4">
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Sample records</strong> · Information workspace preview. Live records are not connected yet.
    </p>
    <GraduateInformationWorkspace graduates={sampleInformationRows} />
  </div>;
}
