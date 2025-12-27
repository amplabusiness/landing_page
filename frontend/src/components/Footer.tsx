import { Logo } from './Logo'
import { Mail, Phone, MapPin, Linkedin, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  const anoAtual = new Date().getFullYear()

  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo e descricao */}
          <div className="md:col-span-2">
            <Logo size="md" variant="light" />
            <p className="text-dark-400 mt-4 max-w-md">
              Contta e a plataforma de inteligencia fiscal que prepara contadores
              e empresas para a Reforma Tributaria brasileira (IBS/CBS 2026).
            </p>
            <p className="text-dark-500 text-sm mt-4">
              Desenvolvido por AMPLA Contabilidade LTDA
            </p>

            {/* Redes sociais */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-dark-800 hover:bg-primary-500 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-all"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              <li>
                <a href="#simulador" className="text-dark-400 hover:text-white transition-colors">
                  Simulador NF-e
                </a>
              </li>
              <li>
                <a href="#recursos" className="text-dark-400 hover:text-white transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#planos" className="text-dark-400 hover:text-white transition-colors">
                  Planos e Precos
                </a>
              </li>
              <li>
                <a href="#" className="text-dark-400 hover:text-white transition-colors">
                  API para Desenvolvedores
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contato@contta.com.br"
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <Mail size={16} />
                  contato@contta.com.br
                </a>
              </li>
              <li>
                <a
                  href="tel:+556232222222"
                  className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                  <Phone size={16} />
                  (62) 3222-2222
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-dark-400">
                  <MapPin size={16} className="flex-shrink-0 mt-1" />
                  Goiania - GO, Brasil
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisoria */}
        <div className="border-t border-dark-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-dark-500 text-sm">
              {anoAtual} Contta - Inteligencia Fiscal. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-dark-500 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-dark-500 hover:text-white transition-colors">
                Politica de Privacidade
              </a>
              <a href="#" className="text-dark-500 hover:text-white transition-colors">
                LGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
