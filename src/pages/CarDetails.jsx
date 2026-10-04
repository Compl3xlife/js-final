import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { asset, fetchVin, formatNum } from "../api.js";
import { HomeHeader, Shell } from "../components/Chrome.jsx";

export default function CarDetails() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from || "/cars";
  const [car, setCar] = useState(location.state?.car || null);
  const [specs, setSpecs] = useState(null);
  const [status, setStatus] = useState(car ? "ready" : "loading");

  useEffect(() => {
    window.scrollTo(0, 0);
    let found = location.state?.car || null;
    if (!found) {
      try {
        const saved = JSON.parse(sessionStorage.getItem("blinker-listings") || "[]");
        found = saved.find((item) => String(item.id) === String(id)) || null;
      } catch {
        found = null;
      }
    }
    setCar(found);
    setStatus(found ? "ready" : "missing");
    document.title = found ? `${found.title} | Blinker` : "Car | Blinker";
    if (!found?.vin) return undefined;
    let cancel = false;
    fetchVin(found.vin)
      .then((next) => {
        if (!cancel) setSpecs(next);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, [id, location.state]);

  const dealer = [car?.dealer?.name, car?.dealer?.city, car?.dealer?.state].filter(Boolean).join(", ");

  return (
    <Shell variant="home" header={<HomeHeader />}>
      <article className="movie-page">
        <Link className="movie-back" to={backTo}>← Back</Link>
        {status === "missing" ? <h1 className="movie-title">That car could not be loaded.</h1> : null}
        {car ? (
          <div className="movie-detail">
            <img src={car.photo || asset("img/carpark.8742e246.jpeg")} alt="" />
            <div>
              <h1 className="movie-title">{car.title}</h1>
              <p className="movie-facts">{`$${formatNum(car.price)}`}</p>
              {car.previous ? <p className="movie-facts">{`Was $${formatNum(car.previous)}`}</p> : null}
              <dl className="movie-meta">
                <Meta label="Mileage" value={car.miles ? `${formatNum(car.miles)} mi` : "Mileage unavailable"} />
                {car.body ? <Meta label="Body" value={car.body} /> : null}
                {car.transmission ? <Meta label="Transmission" value={car.transmission} /> : null}
                {dealer ? <Meta label="Dealer" value={dealer} /> : null}
                {specs?.engine ? <Meta label="Engine" value={specs.engine} /> : null}
                {specs?.drivetrain ? <Meta label="Drivetrain" value={specs.drivetrain} /> : null}
                {specs?.fuel_type ? <Meta label="Fuel" value={specs.fuel_type} /> : null}
                {specs?.city_mpg ? <Meta label="MPG" value={`${specs.city_mpg} city / ${specs.highway_mpg} hwy`} /> : null}
              </dl>
            </div>
          </div>
        ) : null}
      </article>
    </Shell>
  );
}

function Meta({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
