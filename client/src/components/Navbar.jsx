import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NAV } from '../strings/vi';

function navClass({ isActive }) {
  const base =
    'font-display text-base font-semibold tracking-wide md:text-lg min-h-11 px-3 md:px-4 transition-[color,transform,box-shadow] duration-200';
  return isActive
    ? `btn btn-primary ${base} shadow-md shadow-primary/25`
    : `btn btn-ghost ${base} hover:bg-base-200/80`;
}

export function Navbar() {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashPath =
    profile?.role === 'admin'
      ? '/dashboard/admin'
      : profile?.role === 'teacher'
        ? '/dashboard/teacher'
        : '/dashboard/student';

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="navbar sticky top-0 z-40 min-h-16 border-b border-base-300 bg-base-100/95 px-3 py-2 shadow-sm backdrop-blur md:px-5">
      <div className="flex flex-1 items-center">
        <Link
          to="/"
          className="btn btn-ghost gap-2.5 text-2xl font-display font-extrabold tracking-tight normal-case md:text-3xl md:gap-3"
          onClick={closeMobile}
        >
          <img
            src="/img/icon.png"
            alt=""
            className="h-10 w-10 rounded-xl object-cover shadow-md ring-1 ring-base-300/60 md:h-12 md:w-12"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          Secret
          <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">Coder</span>
        </Link>
      </div>

      <div className="flex-none lg:hidden">
        <button
          type="button"
          className="btn btn-square btn-ghost"
          aria-label={mobileOpen ? NAV.CLOSE_MENU : NAV.OPEN_MENU}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <nav
        className={`absolute left-0 right-0 top-full z-40 flex-col gap-1.5 border-b border-base-300 bg-base-100 p-4 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${
          mobileOpen ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <NavLink to="/" end className={navClass} onClick={closeMobile}>
          {NAV.HOME}
        </NavLink>
        <NavLink to="/about" className={navClass} onClick={closeMobile}>
          {NAV.ABOUT}
        </NavLink>
        <NavLink to="/courses" className={navClass} onClick={closeMobile}>
          {NAV.COURSES}
        </NavLink>

        <div className="dropdown dropdown-end lg:dropdown-bottom">
          <div tabIndex={0} role="button" className="btn btn-ghost min-h-11 gap-1.5 px-3 font-display text-base font-semibold tracking-wide md:px-4 md:text-lg">
            {NAV.MORE}
            <ChevronDown className="h-5 w-5 opacity-70" />
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-50 mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
          >
            <li>
              <NavLink to="/team" onClick={closeMobile}>
                {NAV.TEAM}
              </NavLink>
            </li>
            <li>
              <NavLink to="/testimonials" onClick={closeMobile}>
                {NAV.TESTIMONIALS}
              </NavLink>
            </li>
          </ul>
        </div>

        <NavLink to="/contact" className={navClass} onClick={closeMobile}>
          {NAV.CONTACT}
        </NavLink>

        {profile ? (
          <>
            <NavLink to={dashPath} className={navClass} onClick={closeMobile}>
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              {NAV.DASHBOARD}
            </NavLink>
            <button
              type="button"
              className="btn btn-ghost min-h-11 gap-2 px-3 font-display text-base font-semibold tracking-wide text-error md:px-4 md:text-lg"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
              {NAV.SIGN_OUT}
            </button>
          </>
        ) : (
          <NavLink to="/login" className={navClass} onClick={closeMobile}>
            <User className="h-5 w-5 shrink-0" />
            {NAV.SIGN_IN}
          </NavLink>
        )}
      </nav>
    </header>
  );
}
