import { clsx } from 'clsx'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={clsx('bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-0">
          {title && <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
