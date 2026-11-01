import React from 'react'
import {
  AlertTriangle,
  BellRing,
  HardDrive,
  KeyRound,
  MapPin,
  Sparkles,
  UserX,
} from 'lucide-react'
import { trustPoints } from '../../data/landing'
import { LandingLink, Reveal, SectionHead } from './shared'

const icons = [HardDrive, UserX, Sparkles, KeyRound, MapPin, BellRing, AlertTriangle]

export function TrustSection() {
  return (
    <section className="sf-section" id="trust" aria-labelledby="trust-title">
      <div className="sf-container">
        <Reveal>
          <SectionHead
            eyebrow="Privacy & trust"
            title={<span id="trust-title">Private where it can be. Honest where it matters.</span>}
            description="Local-first is only useful if the limits are clear too. These are the points we think every learner should be able to check."
          />
        </Reveal>

        <div className="sf-trust__grid">
          {trustPoints.map((point, index) => {
            const Icon = icons[index] ?? HardDrive
            return (
              <Reveal className="sf-trust__item" key={point.title} delay={0.04 * index} y={16}>
                <span className="sf-trust__icon" aria-hidden="true">
                  <Icon width={16} height={16} />
                </span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.body}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="sf-trust__links" y={10}>
          <LandingLink href="/privacy" variant="secondary">
            Privacy Policy
          </LandingLink>
          <LandingLink href="/terms" variant="ghost">
            Terms
          </LandingLink>
          <LandingLink href="/help" variant="ghost" showArrow>
            Help Centre
          </LandingLink>
        </Reveal>
      </div>
    </section>
  )
}
