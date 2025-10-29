'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/avatar', label: 'Avatar' },
  { href: '/epoch', label: 'Epoch' },
  { href: '/attestations', label: 'Attestations' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-white/10 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Scale className="w-6 h-6 text-aurea-gold group-hover:animate-pulse" />
            <span className="text-xl font-bold">
              <span className="text-aurea-gold">AUREA</span>
              <span className="text-slate-400 text-sm ml-2">.gic</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-aurea-gold',
                  pathname === item.href
                    ? 'text-aurea-gold'
                    : 'text-slate-300'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
