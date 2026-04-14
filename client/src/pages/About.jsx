import { PageHeader } from '../components/PageHeader';
import { ABOUT } from '../strings/vi';

export function About() {
  return (
    <>
      <PageHeader title={ABOUT.TITLE} crumbs={[{ label: ABOUT.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{ABOUT.KICKER}</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-base-content">{ABOUT.H2}</h2>
        <div className="mt-8 space-y-4 text-base-content/85">
          <p>{ABOUT.P1}</p>
          <p>{ABOUT.P2}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.VISION}</h3>
          <p>{ABOUT.P_VISION}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.EXCELLENCE}</h3>
          <p>{ABOUT.P_EXCELLENCE}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.EMPOWER}</h3>
          <p>{ABOUT.P_EMPOWER}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.INNOVATION}</h3>
          <p>{ABOUT.P_INNOVATION}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.COMMUNITY}</h3>
          <p>{ABOUT.P_COMMUNITY}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.DIVERSE}</h3>
          <p>{ABOUT.P_DIVERSE}</p>
          <h3 className="font-display pt-4 text-xl font-bold text-base-content">{ABOUT.IMPROVE}</h3>
          <p>{ABOUT.P_IMPROVE}</p>
          <p className="mt-8 font-medium">{ABOUT.CLOSING}</p>
        </div>
      </div>
    </>
  );
}
