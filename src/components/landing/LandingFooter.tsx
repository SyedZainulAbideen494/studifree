import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { footerColumns, footerCopy } from '../../data/landing'
import { LandingBrand } from './shared'

function FooterLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} className="sf-footer__link">
        {label}
      </Link>
    )
  }
  return (
    <a href={href} className="sf-footer__link">
      {label}
    </a>
  )
}

export function LandingFooter() {
  return (
    <footer className="sf-footer" id="footer">
      <div className="sf-container">
        <div className="sf-footer__top">
          <div className="sf-footer__brand">
            <LandingBrand />
            <p>{footerCopy.statement}</p>
          </div>

          <div className="sf-footer__columns">
            {footerColumns.map((column) => (
              <div key={column.title} className="sf-footer__column">
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="sf-footer__wordmark" aria-hidden="true">
          STUDIFREE
        </div>

        <div className="sf-footer__bottom">
          <div className="sf-footer__credit">
            <span>{footerCopy.credit}</span>
            <span>{footerCopy.note}</span>
          </div>
          <div className="sf-footer__legal">
            <span>© {new Date().getFullYear()} Studifree</span>
            <a href="#top" className="sf-footer__back">
              Back to top <ArrowUp width={12} height={12} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
