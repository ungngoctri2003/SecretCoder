import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Share2, MessageCircle, PlayCircle, Link2 } from 'lucide-react';
import { FOOTER, NAV } from '../strings/vi';

export function Footer() {
  return (
    <footer className="mt-auto bg-neutral text-neutral-content">
      <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <h3 className="mb-4 font-display text-lg font-bold">{FOOTER.QUICK_LINKS}</h3>
          <ul className="space-y-2 text-sm opacity-90">
            <li>
              <Link to="/about" className="link link-hover">
                {NAV.ABOUT}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="link link-hover">
                {NAV.CONTACT}
              </Link>
            </li>
            <li>
              <a href="#" className="link link-hover">
                {FOOTER.PRIVACY}
              </a>
            </li>
            <li>
              <a href="#" className="link link-hover">
                {FOOTER.TERMS}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg font-bold">{FOOTER.CONTACT_TITLE}</h3>
          <ul className="space-y-3 text-sm opacity-90">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>{FOOTER.ADDRESS}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <span>+91 8683045908</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <span>secretcoder@gmail.com</span>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a href="#" className="btn btn-circle btn-ghost btn-sm border border-neutral-content/30" aria-label={FOOTER.SHARE}>
              <Share2 className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="btn btn-circle btn-ghost btn-sm border border-neutral-content/30"
              aria-label={FOOTER.COMMUNITY}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="#" className="btn btn-circle btn-ghost btn-sm border border-neutral-content/30" aria-label={FOOTER.VIDEO}>
              <PlayCircle className="h-4 w-4" />
            </a>
            <a href="#" className="btn btn-circle btn-ghost btn-sm border border-neutral-content/30" aria-label={FOOTER.LINK}>
              <Link2 className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-display text-lg font-bold">{FOOTER.NEWSLETTER}</h3>
          <p className="mb-4 text-sm opacity-90">{FOOTER.NEWSLETTER_DESC}</p>
          <form
            className="join w-full max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              placeholder={FOOTER.EMAIL_PLACEHOLDER}
              className="input input-bordered join-item w-full"
              required
            />
            <button type="submit" className="btn btn-primary join-item">
              {FOOTER.SUBSCRIBE}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-neutral-content/20">
        <div className="container mx-auto max-w-6xl px-4 py-6 text-center text-sm opacity-80">
          ©{' '}
          <Link to="/" className="link link-hover font-medium">
            Secret Coder
          </Link>
          . {FOOTER.COPYRIGHT}
        </div>
      </div>
    </footer>
  );
}
