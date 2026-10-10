// Keep the fixture-backed workspace out of the live dashboard by default.
export const informationWorkspacePreviewEnabled = process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_INFORMATION_WORKSPACE_PREVIEW === 'true';
