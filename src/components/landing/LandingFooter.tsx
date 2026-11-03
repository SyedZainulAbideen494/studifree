import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { footerColumns } from '../../data/landing'
import { LandingBrand } from './shared'

function FooterLink({ href, label }: { href: string; label: string }) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {label} <ArrowUpRight width={12} height={12} aria-hidden="true" />
      </a>
    )
  }

  if (href.startsWith('/')) {
    return <Link to={href}>{label}</Link>
  }

  return <a href={href.startsWith('#') ? href : `#${href}`}>{label}</a>
}

/**
 * Minimal closing frame: brand statement, real destinations, authorship and a
 * quiet technical baseline. No newsletter form, no invented social proof.
 */
export function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="sf-footer">
      <div className="sf-container">
        <div className="sf-footer__top">
          <div className="sf-footer__brand">
            <LandingBrand />
            <p>
              A browser-based learning workspace for understanding, recall, practice and planning. Local
              where it can be, optional AI when you want it.
            </p>
            <span className="sf-footer__tagline">Learning should be for everyone.</span>
          </div>

          {footerColumns.map((column) => (
            <div className="sf-footer__column" key={column.title}>
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

        <div className="sf-footer__wordmark" aria-hidden="true">
          STUDIFREE
        </div>

        <div className="sf-footer__bottom">
          <span>© {year} Studifree · Independent learning project</span>
          <div className="sf-footer__bottom-links">
            <Link to="/help">Help</Link>
            <a href="#top">Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
