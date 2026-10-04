import { useEffect } from "react";
import { Link } from "react-router-dom";
import { asset } from "../api.js";
import { HomeHeader, Shell } from "../components/Chrome.jsx";
import { useWatchlist } from "../watchlist.jsx";

export default function Watchlist() {
  const { items, remove } = useWatchlist();

  useEffect(() => {
    document.title = "Watchlist | Blinker";
  }, []);

  return (
    <Shell variant="home" header={<HomeHeader />}>
      <section className="movie-page">
        <h1 className="movie-title">Watchlist</h1>
        {items.length === 0 ? (
          <p className="movie-plot">
            Nothing saved yet. Open a movie and add it here.
            {" "}
            <Link className="movie-back" to="/">Browse movies</Link>
          </p>
        ) : (
          <div className="recommended-row">
            {items.map((item) => (
              <article key={item.id} className="rec-card saved-card">
                <Link to={`/movie/${item.id}`} state={{ from: "/watchlist" }}>
                  <img src={item.photo || asset("img/carpark.8742e246.jpeg")} alt="" />
                  <strong>{item.title}</strong>
                  <span>{[item.yearLabel, item.rating ? `${item.rating} / 10` : ""].filter(Boolean).join(" · ")}</span>
                </Link>
                <button type="button" onClick={() => remove(item.id)}>Remove</button>
              </article>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
