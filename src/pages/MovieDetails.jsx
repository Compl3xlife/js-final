import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { asset, fetchMovie, fetchRelated } from "../api.js";
import { HomeHeader, Shell } from "../components/Chrome.jsx";
import { useWatchlist } from "../watchlist.jsx";

export default function MovieDetails() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from || "/";
  const watchlist = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancel = false;
    setStatus("loading");
    setMovie(null);
    setRelated([]);
    window.scrollTo(0, 0);
    fetchMovie(id)
      .then((found) => {
        if (cancel) return;
        setMovie(found);
        setStatus("ready");
        document.title = `${found.title} | Blinker`;
        return fetchRelated(found).catch(() => []);
      })
      .then((more) => {
        if (!cancel && Array.isArray(more)) setRelated(more);
      })
      .catch(() => {
        if (cancel) return;
        setStatus("error");
        document.title = "Movie not found | Blinker";
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  const saved = movie ? watchlist.has(movie.id) : false;

  return (
    <Shell variant="home" header={<HomeHeader />}>
      <article className="movie-page">
        <Link className="movie-back" to={backTo}>← Back</Link>
        {status === "loading" ? <DetailsSkeleton /> : null}
        {status === "error" ? (
          <h1 className="movie-title">That movie could not be loaded.</h1>
        ) : null}
        {movie ? (
          <>
            <div className="movie-detail">
              <img src={movie.photo || asset("img/carpark.8742e246.jpeg")} alt="" />
              <div>
                <h1 className="movie-title">{movie.title}</h1>
                <Stars rating={movie.rating} votes={movie.votes} />
                <p className="movie-facts">
                  {[movie.yearLabel, movie.rated, movie.runtime].filter(Boolean).join(" · ")}
                </p>
                {movie.genres.length ? (
                  <div className="movie-chips">
                    {movie.genres.map((genre) => <span key={genre}>{genre}</span>)}
                  </div>
                ) : null}
                {movie.ratings.length ? (
                  <div className="score-row">
                    {movie.ratings.map((entry) => (
                      <div key={entry.Source} className="score-card">
                        <strong>{entry.Value}</strong>
                        <span>{shortSource(entry.Source)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {movie.plot ? (
                  <>
                    <h2>Summary</h2>
                    <p className="movie-plot">{movie.plot}</p>
                  </>
                ) : null}
                <dl className="movie-meta">
                  {movie.director ? <Meta label="Director" value={movie.director} /> : null}
                  {movie.writer ? <Meta label="Writer" value={movie.writer} /> : null}
                  {movie.actors ? <Meta label="Actors" value={movie.actors} /> : null}
                  {movie.language ? <Meta label="Languages" value={movie.language} /> : null}
                  {movie.country ? <Meta label="Country" value={movie.country} /> : null}
                  {movie.boxOffice ? <Meta label="Box office" value={movie.boxOffice} /> : null}
                </dl>
                {movie.awards ? <p className="movie-awards">{movie.awards}</p> : null}
                <button
                  type="button"
                  className={`watch-btn${saved ? " saved" : ""}`}
                  onClick={() => watchlist.toggle(movie)}
                >
                  {saved ? "In your watchlist" : "Add to watchlist"}
                </button>
              </div>
            </div>
            {related.length ? (
              <section className="recommended" aria-label="Recommended movies">
                <h2>Recommended movies</h2>
                <div className="recommended-row">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      className="rec-card"
                      to={`/movie/${item.id}`}
                      state={{ from: `/movie/${movie.id}` }}
                    >
                      <img src={item.photo || asset("img/carpark.8742e246.jpeg")} alt="" />
                      <strong>{item.title}</strong>
                      <span>{item.yearLabel}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
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

function Stars({ rating, votes }) {
  const score = Number(rating);
  if (!score) return null;
  const filled = Math.max(0, Math.min(5, score / 2));
  return (
    <p className="star-row">
      <span className="stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => {
          const amount = Math.max(0, Math.min(1, filled - index));
          return <i key={index} style={{ "--fill": `${amount * 100}%` }}>★</i>;
        })}
      </span>
      <span>{`${score.toFixed(1)} / 10`}</span>
      {votes ? <span className="vote-count">{`${votes} votes`}</span> : null}
    </p>
  );
}

function shortSource(source) {
  if (source.includes("Internet Movie")) return "IMDb";
  if (source.includes("Rotten")) return "Rotten Tomatoes";
  if (source.includes("Metacritic")) return "Metacritic";
  return source;
}

function DetailsSkeleton() {
  return (
    <div className="movie-detail" aria-hidden="true">
      <div className="skeleton poster" />
      <div>
        <div className="skeleton line lg" />
        <div className="skeleton line" />
        <div className="skeleton line" />
        <div className="skeleton block" />
      </div>
    </div>
  );
}
