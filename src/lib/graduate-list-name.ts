interface GraduateListName {
  studentNumber: string | number;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  suffix?: string | null;
}

// Put the sorting field first so staff can scan surname-ordered review lists.
export function graduateListName(row: GraduateListName) {
  const clean = (value?: string | null) => value?.trim().toUpperCase() === 'N/A' ? '' : value?.trim() || '';
  const lastName = clean(row.lastName);
  const givenNames = [row.firstName, row.middleName, row.suffix].map(clean).filter(Boolean).join(' ');
  return [lastName, givenNames].filter(Boolean).join(', ') || `Graduate ${row.studentNumber}`;
}
