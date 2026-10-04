import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { asset } from "../api.js";
import { useWatchlist } from "../watchlist.jsx";

function navClass({ isActive }) {
  return `link${isActive ? " router-link-exact-active router-link-active" : ""}`;
}

function watchLabel(count) {
  return count ? `Watchlist (${count})` : "Watchlist";
}

function PhoneNav({ light, scope }) {
  const { items } = useWatchlist();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const dot = light ? { backgroundColor: "rgb(255, 255, 255)" } : undefined;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div data-v-48b363cf="" {...scope} id="phone-nav">
      <div
        data-v-48b363cf=""
        className={`bento-menu${open ? " hide-anim-out" : ""}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open menu"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") setOpen(true);
        }}
      >
        {Array.from({ length: 9 }, (_, index) => (
          <div data-v-48b363cf="" key={index} style={dot} />
        ))}
      </div>
      <div
        data-v-48b363cf=""
        className={`close-btn${open ? " show" : ""}`}
        onClick={() => setOpen(false)}
        role="button"
        tabIndex={0}
        aria-label="Close menu"
      />
      <nav data-v-48b363cf="" className={`showMenu${open ? " active" : ""}`} aria-label="Mobile">
        <NavLink data-v-48b363cf="" to="/" end className={navClass}>Home</NavLink>
        <NavLink data-v-48b363cf="" to="/cars" className={navClass}>Find Your Car</NavLink>
        <NavLink data-v-48b363cf="" to="/watchlist" className={navClass}>{watchLabel(items.length)}</NavLink>
        <NavLink data-v-48b363cf="" to="/contact" className={navClass}>Contact</NavLink>
      </nav>
    </div>
  );
}

export function HomeHeader() {
  const { items } = useWatchlist();
  return (
    <header data-v-2a11e7ca="" className="navbar">
      <div className="nav content-wrapper justify-between align-center">
        <div className="logo">
          <img src={asset("img/logo.png")} alt="logo" className="logo" />
        </div>
        <nav className="links align-center justify-between" aria-label="Primary">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/cars" className={navClass}>Find your car</NavLink>
          <NavLink to="/watchlist" className={navClass}>{watchLabel(items.length)}</NavLink>
          <NavLink to="/contact" className="btn-contact">Contact</NavLink>
        </nav>
        <PhoneNav light={false} scope={{}} />
      </div>
    </header>
  );
}

export function BrowseHeader({ query, onQuery, onSearch }) {
  const scope = { "data-v-390ceb07": "" };
  const { items } = useWatchlist();
  return (
    <div {...scope} className="navbar flex flex-col">
      <div {...scope} className="flex content-wrapper justify-between align-center" style={{ flexDirection: "row", zIndex: 1005 }}>
        <div {...scope} className="logo">
          <img {...scope} src={asset("img/logo.png")} alt="logo" className="logo" />
        </div>
        <nav {...scope} className="links flex align-center justify-between" aria-label="Primary">
          <NavLink {...scope} to="/" end className={navClass}>Home</NavLink>
          <NavLink {...scope} to="/cars" className={navClass}>Find your car</NavLink>
          <NavLink {...scope} to="/watchlist" className={navClass}>{watchLabel(items.length)}</NavLink>
          <NavLink {...scope} to="/contact" className="btn-contact">Contact</NavLink>
        </nav>
        <PhoneNav light scope={{ "data-v-390ceb07": "" }} />
      </div>
      <div {...scope} className="content-wrapper flex-col align-center" style={{ marginTop: 40 }}>
        <h1 {...scope}>Browse our cars</h1>
        <form
          {...scope}
          className="input-wrap"
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
        >
          <input
            {...scope}
            type="text"
            placeholder="Search by Make, Model or Keyword"
            aria-label="Search cars"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          <button {...scope} className="search-wrapper flex justify-center align-center" type="submit" aria-label="Search">
            <SearchMark />
          </button>
        </form>
      </div>
      <div {...scope} className="overlay" />
    </div>
  );
}

function SearchMark() {
  return (
    <svg data-v-390ceb07="" aria-hidden="true" focusable="false" viewBox="0 0 512 512" className="svg-inline--fa fa-search fa-w-16">
      <path data-v-390ceb07="" fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="content-wrapper justify-between align-center">
        <p>Movies are loaded from OMDb. Car listings are loaded from the unhuman auto car API.</p>
        <nav aria-label="Footer">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/cars">Find your car</NavLink>
          <NavLink to="/watchlist">Watchlist</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
    </footer>
  );
}

export function Shell({ variant, header, children }) {
  const scope = variant === "browse" ? { "data-v-040c1d60": "" } : { "data-v-2a11e7ca": "" };
  return (
    <div {...scope} data-v-5fdf2371="" className="flex flex-col" style={{ display: "flex", flex: "1 1 0%" }}>
      {header}
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function SortSelect({ value, onChange, label }) {
  return (
    <div className="sort-filter flex flex-col">
      <h2 data-v-66aecfa2="">
        <span data-v-66aecfa2="" className="black-txt" style={{ marginRight: 8 }}>{label}</span>
      </h2>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {label === "Sort" ? (
          <>
            <option value="newest">Year, newest to oldest</option>
            <option value="oldest">Year, oldest to newest</option>
            <option value="az">Alphabetical A to Z</option>
            <option value="za">Alphabetical Z to A</option>
          </>
        ) : (
          <>
            <option value="all">All years</option>
            <option value="2020">2020 and newer</option>
            <option value="2010">2010s</option>
            <option value="2000">2000s</option>
            <option value="1990">1990s</option>
            <option value="older">Before 1990</option>
          </>
        )}
      </select>
    </div>
  );
}

export function EmptyState({ onReset }) {
  return (
    <div data-v-ca62299c="" className="empty-state flex flex-col align-center">
      <img data-v-ca62299c="" src={asset("img/filters.68be3816.svg")} alt="" />
      <h1 data-v-ca62299c="">Could not find any matches related to your search.</h1>
      <span data-v-ca62299c="">Please change the filter or reset it below.</span>
      <button data-v-ca62299c="" type="button" onClick={onReset}>Reset filter</button>
    </div>
  );
}
