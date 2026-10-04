import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { asset } from "../api.js";
import { HomeHeader, Shell } from "../components/Chrome.jsx";
import { SearchIcon } from "../components/Icons.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [drive, setDrive] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    document.title = "Blinker";
    const start = window.setTimeout(() => {
      setDrive(true);
      setRolling(true);
    }, 400);
    const stop = window.setTimeout(() => {
      setRolling(false);
      setBlink(true);
    }, 2500);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    const term = draft.trim();
    navigate(term ? `/cars?q=${encodeURIComponent(term)}` : "/cars");
  }

  return (
    <Shell variant="home" header={<HomeHeader />}>
      <section data-v-2a11e7ca="" id="landing-page">
        <div data-v-2a11e7ca="" className="content-wrapper flex-col align-center justify-between" style={{ position: "relative" }}>
          <div data-v-2a11e7ca="" className="flex flex-col align-center" style={{ zIndex: 10, backgroundColor: "rgb(255, 255, 255)" }}>
            <h1 data-v-2a11e7ca="">America&apos;s most awarded car subscription platform</h1>
            <h2 data-v-2a11e7ca="">
              {" Find your dream car with "}
              <span data-v-2a11e7ca="" style={{ color: "rgb(53, 104, 44)" }}>Blinker</span>
            </h2>
            <form data-v-2a11e7ca="" className="input-wrapper" onSubmit={submit} role="search">
              <input
                data-v-2a11e7ca=""
                type="text"
                placeholder="Search by Make, Model or Keyword"
                aria-label="Search by make, model, or keyword"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button data-v-2a11e7ca="" className="not-loading" type="submit" aria-label="Search">
                <SearchIcon data-v-2a11e7ca="" />
              </button>
            </form>
          </div>
          <img data-v-2a11e7ca="" src={asset("img/building-green.png")} alt="" className="building" />
          <div
            data-v-53a4c488=""
            data-v-2a11e7ca=""
            className="car-wrapper"
            style={{ transform: drive ? "translateX(0)" : "translateX(-100vw)" }}
          >
            <div data-v-53a4c488="" className="car">
              <img
                data-v-53a4c488=""
                src={asset("img/headlight.png")}
                alt=""
                className={blink ? "blinker headlights-blink" : "blinker"}
              />
              <div data-v-53a4c488="" className={rolling ? "wheel wheel1 rotateWheel" : "wheel wheel1"} />
              <div data-v-53a4c488="" className={rolling ? "wheel wheel2 rotateWheel" : "wheel wheel2"} />
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
