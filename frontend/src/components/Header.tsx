import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Calculator, FileText, CreditCard, Phone } from 'lucide-react'
import { Logo } from './Logo'

const navLinks = [
  { href: '#calculadora', label: 'Calculadora', icon: Calculator },
  { href: '#recursos', label: 'Recursos', icon: FileText },
  { href: '#planos', label: 'Planos', icon: CreditCard },
  { href: '#contato', label: 'Contato', icon: Phone },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-primary-700/90 backdrop-blur-lg" />

      <nav className="relative container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="relative z-10">
            <Logo size="md" variant="light" />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
              >
                <link.icon size={18} />
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#simulador"
              className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-accent-500/30"
            >
              Testar Gratis
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden relative z-10 p-2 text-white"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-white/20"
            >
              <div className="flex flex-col gap-4 pt-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 text-white/80 hover:text-white transition-colors font-medium py-2"
                  >
                    <link.icon size={20} />
                    {link.label}
                  </a>
                ))}
                <a
                  href="#simulador"
                  className="mt-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg text-center"
                >
                  Testar Gratis
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
