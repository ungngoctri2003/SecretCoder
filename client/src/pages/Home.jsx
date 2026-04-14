import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HOME } from '../strings/vi';

const slides = [
  {
    image: '/img/carousel-1.jpg',
    kicker: HOME.SLIDE1_KICKER,
    title: HOME.SLIDE1_TITLE,
    text: HOME.SLIDE1_TEXT,
    primary: { to: '/about', label: HOME.READ_MORE },
    secondary: { to: '/signup', label: HOME.JOIN_NOW },
  },
  {
    image: '/img/carousel-2.jpg',
    kicker: HOME.SLIDE2_KICKER,
    title: HOME.SLIDE2_TITLE,
    text: HOME.SLIDE2_TEXT,
    primary: { to: '/courses', label: HOME.BROWSE_COURSES },
    secondary: null,
  },
];

export function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(t);
  }, []);

  const slide = slides[index];
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <>
      <section className="relative mb-8 min-h-[420px] overflow-hidden md:min-h-[520px]">
        <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-base-content/85 to-base-content/50" />
        <div className="relative z-10 mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-4 py-16 md:min-h-[520px]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">{slide.kicker}</p>
          <h1 className="font-display text-4xl font-bold leading-tight text-base-100 md:text-5xl lg:max-w-3xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-base-100/90">{slide.text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={slide.primary.to} className="btn btn-primary">
              {slide.primary.label}
            </Link>
            {slide.secondary ? (
              <Link
                to={slide.secondary.to}
                className="btn btn-outline border-base-100 text-base-100 hover:bg-base-100 hover:text-base-content"
              >
                {slide.secondary.label}
              </Link>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-circle btn-ghost absolute left-2 top-1/2 z-20 -translate-y-1/2 border border-base-100/30 text-base-100"
          aria-label={HOME.PREV_SLIDE}
          onClick={prev}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          type="button"
          className="btn btn-circle btn-ghost absolute right-2 top-1/2 z-20 -translate-y-1/2 border border-base-100/30 text-base-100"
          aria-label={HOME.NEXT_SLIDE}
          onClick={next}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-base-100/50'}`}
              aria-label={HOME.GO_SLIDE(i + 1)}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-14 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{HOME.SECTION_COURSES}</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-base-content md:text-4xl">{HOME.POPULAR_COURSES}</h2>
        <Link to="/courses" className="btn btn-primary btn-wide mt-8">
          {HOME.VIEW_ALL_COURSES}
        </Link>
      </section>

      <section
        className="relative bg-cover bg-center py-16"
        style={{ backgroundImage: "url('/img/banner-3.jpg')" }}
      >
        <div className="absolute inset-0 bg-base-content/75" />
        <div className="container relative z-10 mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <img src="/img/banner-2.png" alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{HOME.INSTRUCTOR_TITLE}</h2>
              <p className="mt-4 text-base-100/90">{HOME.INSTRUCTOR_TEXT}</p>
              <Link
                to="/instructor"
                className="btn btn-outline mt-6 border-primary text-primary hover:bg-primary hover:text-primary-content"
              >
                {HOME.START_TEACHING}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
