'use client';

import { LiveInformationWorkspace } from '@/features/graduate-information/LiveInformationWorkspace';

export function InformationWorkspaceTab({ role }: { role: 'proofreader' | 'qc' | 'moderator' }) {
  return <LiveInformationWorkspace role={role} />;
}
