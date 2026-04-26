/** Easing aligned with Navbar (cubic-bezier(0.33, 1, 0.68, 1)). */
export const EASE_NAV = [0.33, 1, 0.68, 1];

/** framer `viewport` for scroll-driven sections (shared with ScrollBlock, Home). */
export const scrollViewport = { once: true, amount: 0.18 };

const baseTransition = { duration: 0.42, ease: EASE_NAV };
const shortTransition = { duration: 0.32, ease: EASE_NAV };
const enterTransition = { duration: 0.5, ease: EASE_NAV };

/**
 * @param {boolean} reduced
 * @returns {import('framer-motion').Transition}
 */
export function getTransition(reduced) {
  if (reduced) return { duration: 0 };
  return baseTransition;
}

/**
 * @param {boolean} reduced
 * @returns {import('framer-motion').Transition}
 */
export function getShortTransition(reduced) {
  if (reduced) return { duration: 0 };
  return shortTransition;
}

/**
 * @param {boolean} reduced
 * @returns {import('framer-motion').Transition}
 */
export function getEnterTransition(reduced) {
  if (reduced) return { duration: 0 };
  return enterTransition;
}

export const heroBg = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.55, ease: EASE_NAV } },
  exit: { opacity: 0, transition: { duration: 0.38, ease: EASE_NAV } },
};

/**
 * @param {boolean} reduced
 */
export function getHeroBg(reduced) {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 1, transition: { duration: 0 } },
    };
  }
  return heroBg;
}

/**
 * @param {boolean} reduced
 * @param {{ strongEntry?: boolean }} [options] — lần đầu vào trang: stagger + delay mạnh hơn
 */
export function getHeroStaggerRoot(reduced, { strongEntry = false } = {}) {
  return {
    hidden: {},
    visible: {
      transition: reduced
        ? { duration: 0 }
        : {
            staggerChildren: strongEntry ? 0.12 : 0.09,
            delayChildren: strongEntry ? 0.2 : 0.04,
            when: 'beforeChildren',
          },
    },
  };
}

/** Cả block hero: fade + trượt nhẹ lúc mở trang. Trải spread lên `motion` root của hero. */
export function getHomeHeroSectionProps(reduced) {
  if (reduced) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: EASE_NAV },
  };
}

export const heroLine = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: getEnterTransition(reduced),
  },
});

export const heroBlock = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: getEnterTransition(reduced),
  },
});

export const sectionInView = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: getTransition(reduced),
  },
});

/** Khối đầu dưới fold (đặc trưng) — chuyển động mạnh hơn khi lần đầu scroll tới */
export const sectionInViewDramatic = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.58, ease: EASE_NAV },
  },
});

export const staggerGrid = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0 },
  visible: {
    opacity: 1,
    transition: reduced
      ? { duration: 0 }
      : { staggerChildren: 0.07, delayChildren: 0.05 },
  },
});

export const staggerItem = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: getShortTransition(reduced),
  },
});

export const imageReveal = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...getTransition(reduced) },
  },
});

export const routeFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: EASE_NAV } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE_NAV } },
};

/**
 * @param {boolean} reduced
 */
export function getRouteFade(reduced) {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 1, transition: { duration: 0 } },
    };
  }
  return routeFade;
}
