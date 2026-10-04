import { Link, useLocation } from "react-router-dom";
import { asset, formatNum } from "../api.js";
import { ArrowIcon, InfoRow } from "./Icons.jsx";

const scope = { "data-v-ca62299c": "" };

export default function ListingCard({ item }) {
  const location = useLocation();
  const photo = item.photo || asset("img/carpark.8742e246.jpeg");
  const body = (
    <>
      <div {...scope} className="top">
        <img
          {...scope}
          alt=""
          src={photo}
          onError={(event) => {
            event.currentTarget.src = asset("img/carpark.8742e246.jpeg");
          }}
        />
        <div {...scope} className="view-car">
          <span style={{ marginRight: 8 }}>More info</span>
          <ArrowIcon />
        </div>
      </div>
      <div {...scope} className="bot">
        <div {...scope} className="title">{item.title || "Untitled"}</div>
        {item.kind === "movie" ? (
          <>
            <InfoRow icon="car-side" text={item.yearLabel || "Year unknown"} />
            <InfoRow icon="cogs" text="Movie" />
          </>
        ) : (
          <>
            <InfoRow icon="tachometer-alt" text={item.miles ? `${formatNum(item.miles)} mi` : "Mileage unavailable"} />
            <InfoRow icon="car-side" text={item.body || "Body unknown"} />
            <InfoRow icon="cogs" text={item.transmission || "Transmission unknown"} />
          </>
        )}
        <div className="flex justify-between" style={{ marginTop: 30 }}>
          <h2 {...scope} className="price">
            {item.kind !== "movie" && item.previous ? (
              <span {...scope} className="prev">{`$${formatNum(item.previous)}`}</span>
            ) : null}
            <span {...scope} className="curr">
              {item.kind === "movie" ? (item.yearLabel || "") : `$${formatNum(item.price)}`}
            </span>
          </h2>
        </div>
      </div>
    </>
  );

  const destination = item.kind === "movie" ? `/movie/${item.id}` : `/car/${encodeURIComponent(item.id)}`;
  const linkState = item.kind === "movie"
    ? { from: `${location.pathname}${location.search}` }
    : { from: `${location.pathname}${location.search}`, car: item };

  return (
    <div {...scope} className="card-wrapper">
      <Link {...scope} to={destination} className="card" state={linkState}>
        {body}
      </Link>
    </div>
  );
}
