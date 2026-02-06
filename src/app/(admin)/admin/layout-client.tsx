'use client'

import React, { useState } from 'react'
import Header from '@/components/admin/Header'
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="admin-shell relative flex min-h-screen bg-slate-950 text-slate-100">
      <a
        href="#admin-main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-slate-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      >
        Skip to main content
      </a>

      <Sidebar
        isMobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-56 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <Header onMenuToggle={() => setMobileNavOpen((prev) => !prev)} />

        <main
          id="admin-main-content"
          className="relative z-10 flex-1 overflow-x-hidden overflow-y-auto"
        >
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
