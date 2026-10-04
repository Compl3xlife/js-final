import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { formatNum, PRICE_MAX, searchCars, searchMovies, sortListings } from "../api.js";
import { BrowseHeader, EmptyState, Shell, SortSelect } from "../components/Chrome.jsx";
import { Spinner } from "../components/Icons.jsx";
import ListingCard from "../components/ListingCard.jsx";

export default function Cars() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [draft, setDraft] = useState(query);
  const [sort, setSort] = useState("az");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [committed, setCommitted] = useState({ min: 0, max: PRICE_MAX });
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    document.title = "Find your car | Blinker";
  }, []);

  useEffect(() => {
    let cancel = false;
    setStatus("loading");
    const load = query.trim().toLowerCase() === "fast"
      ? searchMovies("fast")
      : searchCars(query, committed.min, committed.max);
    load
      .then((found) => {
        if (cancel) return;
        setItems(found);
        setStatus("ready");
        sessionStorage.setItem("blinker-listings", JSON.stringify(found));
      })
      .catch(() => {
        if (cancel) return;
        setItems([]);
        setStatus("error");
      });
    return () => {
      cancel = true;
    };
  }, [query, committed]);

  function search() {
    const next = new URLSearchParams(params);
    const term = draft.trim();
    if (term) next.set("q", term);
    else next.delete("q");
    setParams(next);
  }

  function reset() {
    setDraft("");
    setSort("az");
    setPriceMin(0);
    setPriceMax(PRICE_MAX);
    setCommitted({ min: 0, max: PRICE_MAX });
    setParams({});
  }

  const moviesOnly = query.trim().toLowerCase() === "fast";
  const visible = sortListings(
    items.filter((item) => moviesOnly || (item.price >= priceMin && item.price <= priceMax)),
    sort
  );
  const heading = query ? (
    <>
      <span data-v-66aecfa2="" className="black-txt">Search results for</span>
      {` "${query}"`}
    </>
  ) : (
    <span data-v-66aecfa2="" className="black-txt">Search results:</span>
  );

  return (
    <Shell
      variant="browse"
      header={<BrowseHeader query={draft} onQuery={setDraft} onSearch={search} />}
    >
      <section data-v-040c1d60="" id="search">
        <div
          data-v-040c1d60=""
          className="md-progress-bar md-indeterminate md-theme-default"
          style={{ position: "absolute", top: 0, left: 0, right: 0, display: status === "loading" ? "block" : "none" }}
        >
          <div className="md-progress-bar-track" />
          <div className="md-progress-bar-fill" />
          <div className="md-progress-bar-buffer" />
        </div>
        <div data-v-66aecfa2="" data-v-040c1d60="" id="filter" className="content-wrapper justify-between">
          <h1 data-v-66aecfa2="" className="search-info">{heading}</h1>
          <SortSelect label="Sort" value={sort} onChange={setSort} />
          <PriceSlider
            min={priceMin}
            max={priceMax}
            onPreview={(min, max) => {
              setPriceMin(min);
              setPriceMax(max);
            }}
            onCommit={(min, max) => {
              setPriceMin(min);
              setPriceMax(max);
              setCommitted((current) => (current.min === min && current.max === max ? current : { min, max }));
            }}
          />
        </div>
        <div data-v-ca62299c="" data-v-040c1d60="" id="cars">
          <div data-v-ca62299c="" className="content-wrapper">
            {status === "loading" ? <Spinner /> : null}
            {status !== "loading" && visible.length === 0 ? <EmptyState onReset={reset} /> : null}
            {status !== "loading"
              ? visible.map((item) => (
                <ListingCard key={`${item.kind}-${item.id}`} item={item} />
              ))
              : null}
          </div>
        </div>
      </section>
    </Shell>
  );
}

function PriceSlider({ min, max, onPreview, onCommit }) {
  const runway = useRef(null);
  const current = useRef({ min, max });
  current.current = { min, max };

  function update(clientX, which, commit) {
    const rect = runway.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const stepped = Math.round((ratio * PRICE_MAX) / 1000) * 1000;
    const low = current.current.min;
    const high = current.current.max;
    const nextMin = which === "min" ? Math.min(stepped, high) : low;
    const nextMax = which === "max" ? Math.max(stepped, low) : high;
    if (commit) onCommit(nextMin, nextMax);
    else onPreview(nextMin, nextMax);
  }

  function bind(which) {
    return (event) => {
      event.preventDefault();
      const move = (moveEvent) => update(moveEvent.clientX, which, false);
      const up = (upEvent) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        update(upEvent.clientX, which, true);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
  }

  const left = (min / PRICE_MAX) * 100;
  const right = (max / PRICE_MAX) * 100;

  return (
    <div data-v-66aecfa2="" className="price-filter flex flex-col">
      <h2 data-v-66aecfa2="">
        <span data-v-66aecfa2="" className="black-txt" style={{ marginRight: 8 }}>Price range:</span>
        {` $${formatNum(min)} to $${formatNum(max)} `}
      </h2>
      <div data-v-66aecfa2="" className="slider-wrapper">
        <div className="el-slider" role="slider" aria-valuemin={0} aria-valuemax={PRICE_MAX} aria-label="Price range">
          <div className="el-slider__runway" ref={runway}>
            <div className="el-slider__bar" style={{ left: `${left}%`, width: `${right - left}%` }} />
            <div className="el-slider__button-wrapper" style={{ left: `${left}%` }} onPointerDown={bind("min")}>
              <div className="el-slider__button" />
            </div>
            <div className="el-slider__button-wrapper" style={{ left: `${right}%` }} onPointerDown={bind("max")}>
              <div className="el-slider__button" />
            </div>
            <div className="el-slider__marks">
              <div className="el-slider__marks-text" style={{ left: "0%" }}>$0</div>
              <div className="el-slider__marks-text" style={{ left: "100%" }}>$100,000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
