import FadeTransition from './FadeTransition.jsx'
import CurtainTransition from './CurtainTransition.jsx'

export const TRANSITIONS = {
  fade: FadeTransition,
  curtain: CurtainTransition,
}

export const FALLBACK_TRANSITION = 'fade'

// Seconds the navbar logo waits before turning white when entering /tours,
// so it changes as the new page is revealed instead of over the old one.
// Leaving /tours is never delayed: the logo recolours first, before the
// curtain starts moving.
export const LOGO_WHITE_DELAY = {
  fade: 0.3,
  curtain: 1.4,
}