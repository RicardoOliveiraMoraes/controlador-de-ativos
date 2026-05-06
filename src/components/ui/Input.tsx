import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-300 dark:border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-300 dark:border-slate-600',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
