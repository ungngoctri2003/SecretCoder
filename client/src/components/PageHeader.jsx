import { Link } from 'react-router-dom';
import { PAGE } from '../strings/vi';

export function PageHeader({ title, crumbs = [] }) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-content">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, oklch(100% 0 0), transparent 45%), radial-gradient(circle at 80% 70%, oklch(100% 0 0), transparent 40%)',
        }}
      />
      <div className="container relative mx-auto max-w-6xl px-4 py-14 text-center md:py-20">
        <h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight drop-shadow-sm md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <div className="breadcrumbs mt-8 justify-center text-base font-medium text-primary-content/90 md:mt-10 md:text-lg">
          <ul>
            <li>
              <Link to="/" className="link link-hover text-primary-content">
                {PAGE.HOME_CRUMB}
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label}>
                {c.to && !c.active ? (
                  <Link to={c.to} className="link link-hover text-primary-content">
                    {c.label}
                  </Link>
                ) : (
                  <span className="opacity-100">{c.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
