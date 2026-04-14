import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { INSTRUCTOR_PAGE } from '../strings/vi';

export function Instructor() {
  return (
    <>
      <PageHeader title={INSTRUCTOR_PAGE.TITLE} crumbs={[{ label: INSTRUCTOR_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{INSTRUCTOR_PAGE.H2}</h2>
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <h3 className="font-display text-xl font-semibold">{INSTRUCTOR_PAGE.H3}</h3>
          <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.P1}</p>
          <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.P2}</p>
          <Link to="/signup" className="btn btn-primary mt-6">
            {INSTRUCTOR_PAGE.CTA}
          </Link>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-base-300 shadow-lg">
            <img src="/img/about.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">{INSTRUCTOR_PAGE.WHY}</h2>
            <p className="mt-4 text-base-content/80">{INSTRUCTOR_PAGE.WHY_P}</p>
          </div>
        </div>
      </div>
    </>
  );
}
