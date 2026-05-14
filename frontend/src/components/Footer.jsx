import React from 'react'
import { RiExternalLinkLine, RiChat3Line } from 'react-icons/ri'

const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Live Polls', 'Analytics', 'Integrations'],
  },
  {
    title: 'Developers',
    links: ['API Reference', 'Documentation', 'SDKs', 'Webhooks'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Contact', 'Legal'],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <img src="/voicora-logo.png" alt="Voicora" className="w-4 h-4 invert" />
              <span className="text-[15px] font-semibold text-text-primary">Voicora</span>
            </a>
            <p className="text-[13px] text-text-faint leading-relaxed max-w-xs mb-6">
              The modern platform for live polling, real-time feedback, and audience engagement.
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="w-8 h-8 rounded-md bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center text-text-faint hover:text-text-primary transition-all" aria-label="GitHub">
                <RiExternalLinkLine className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-md bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center text-text-faint hover:text-text-primary transition-all" aria-label="Community">
                <RiChat3Line className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-medium tracking-wider uppercase text-text-muted mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-text-faint hover:text-text-primary transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border-subtle gap-4">
          <p className="text-[11px] text-text-faint">
            © {new Date().getFullYear()} Voicora. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] text-text-faint hover:text-text-muted transition-colors">Privacy</a>
            <a href="#" className="text-[11px] text-text-faint hover:text-text-muted transition-colors">Terms</a>
            <a href="#" className="text-[11px] text-text-faint hover:text-text-muted transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
