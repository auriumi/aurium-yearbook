'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FilterOptions, VerificationFilters } from './api';

interface Props {
  filters: VerificationFilters;
  options: FilterOptions | null;
  optionsError: string;
  searchInput: string;
  disabled: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (patch: Partial<VerificationFilters>) => void;
}

const selectStyle = 'mt-2 h-11 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700';

export function VerificationFiltersPanel({
  filters, options, optionsError, searchInput, disabled, onSearchChange, onFilterChange,
}: Props) {
  const thisYear = new Date().getFullYear();
  const years = [thisYear - 1, thisYear, thisYear + 1];
  const hasFilters = !!(filters.department || filters.program || filters.major || searchInput);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <label className="text-xs font-semibold text-stone-600">
          Graduation year
          <select
            value={filters.year}
            disabled={disabled}
            onChange={event => onFilterChange({ year: Number(event.target.value) })}
            className={selectStyle}
          >
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Graduation term
          <select
            value={filters.term}
            disabled={disabled}
            onChange={event => onFilterChange({ term: event.target.value as VerificationFilters['term'] })}
            className={selectStyle}
          >
            <option value="END_YEAR">End year</option>
            <option value="MID_YEAR">Mid year</option>
          </select>
        </label>

        <div>
          <label htmlFor="rac-search" className="text-xs font-semibold text-stone-600">Search graduates</label>
          <div className="relative mt-2">
            <Search size={17} className="pointer-events-none absolute left-3 top-3.5 text-stone-400" aria-hidden="true" />
            <Input
              id="rac-search"
              type="search"
              maxLength={80}
              placeholder="Name or full student number"
              value={searchInput}
              disabled={disabled}
              onChange={event => onSearchChange(event.target.value)}
              className="h-11 border-stone-200 bg-white pl-10 text-sm"
            />
          </div>
        </div>

        <label className="text-xs font-semibold text-stone-600">
          Department
          <select
            value={filters.department}
            disabled={disabled}
            onChange={event => onFilterChange({ department: event.target.value, program: '', major: '' })}
            className={selectStyle}
          >
            <option value="">All assigned departments</option>
            {options?.departments.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Program
          <select
            value={filters.program}
            disabled={disabled}
            onChange={event => onFilterChange({ program: event.target.value, major: '' })}
            className={selectStyle}
          >
            <option value="">All programs</option>
            {options?.programs.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="text-xs font-semibold text-stone-600">
          Major
          <select
            value={filters.major}
            disabled={disabled}
            onChange={event => onFilterChange({ major: event.target.value })}
            className={selectStyle}
          >
            <option value="">All majors</option>
            {options?.hasNoMajor && <option value="__no_major__">No major</option>}
            {options?.majors.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-stone-500">Counts reflect the selected cycle, search and academic filters.</p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasFilters || disabled}
          onClick={() => {
            onSearchChange('');
            onFilterChange({ department: '', program: '', major: '', search: '' });
          }}
        >
          Clear filters
        </Button>
      </div>
      {optionsError && <p role="alert" className="mt-2 text-sm text-red-700">{optionsError}</p>}
    </div>
  );
}
