import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { imageReveal, scrollViewport, sectionInView, staggerGrid, staggerItem } from './variants';

/**
 * @param {object} props
 * @param {boolean} props.reduced
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 * @param {'div' | 'section'} [props.as]
 */
export function ScrollSection({ reduced, children, className, as: Tag = 'div' }) {
  const Motion = Tag === 'section' ? motion.section : motion.div;
  return (
    <Motion
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={sectionInView(reduced)}
    >
      {children}
    </Motion>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.reduced
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function StaggerContainer({ reduced, children, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerGrid(reduced)}
    >
      {children}
    </motion.div>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.reduced
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function StaggerItem({ reduced, children, className }) {
  return (
    <motion.div className={className} variants={staggerItem(reduced)}>
      {children}
    </motion.div>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.reduced
 * @param {import('react').ReactNode} props.children
 * @param {string} [props.className]
 */
export function ImageReveal({ reduced, children, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
      variants={imageReveal(reduced)}
    >
      {children}
    </motion.div>
  );
}
