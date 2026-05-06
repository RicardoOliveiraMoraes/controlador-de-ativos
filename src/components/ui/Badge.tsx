import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gain' | 'loss' | 'neutral' | 'info'
  size?: 'sm' | 'md'
}

const variants = {
  gain: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  loss: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  info: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center font-medium rounded-full', variants[variant], sizes[size])}>
      {children}
    </span>
  )
}
