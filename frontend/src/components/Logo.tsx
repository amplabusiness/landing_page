import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'light' | 'dark'
}

export function Logo({ size = 'md', showText = true, variant = 'light' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' }
  }

  const textColor = variant === 'light' ? 'text-white' : 'text-primary-600'
  const subColor = variant === 'light' ? 'text-primary-200' : 'text-primary-500'

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icone circular estilizado - baseado no logo Contta */}
      <div className="relative">
        <svg
          width={sizes[size].icon}
          height={sizes[size].icon}
          viewBox="0 0 56 56"
          fill="none"
        >
          {/* Circulo externo azul escuro */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="#023E8A"
            strokeWidth="4"
            fill="none"
          />
          {/* Circulo interno azul claro */}
          <circle
            cx="28"
            cy="28"
            r="16"
            stroke="#00B4D8"
            strokeWidth="3"
            fill="none"
          />
          {/* Arco de destaque */}
          <path
            d="M 28 8 A 20 20 0 0 1 48 28"
            stroke="#90E0EF"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ponto central */}
          <circle
            cx="28"
            cy="28"
            r="4"
            fill="#0077B6"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight ${sizes[size].text} ${textColor}`}>
            CONTTA
          </span>
          <span className={`text-xs font-medium tracking-widest uppercase ${subColor}`}>
            Inteligencia Fiscal
          </span>
        </div>
      )}
    </motion.div>
  )
}
