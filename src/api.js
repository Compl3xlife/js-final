const OMDB_URL = "https://www.omdbapi.com/";
const OMDB_KEY = "4cfe7eb4";
const MOVIE_LIMIT = 6;

export const PRICE_MAX = 100000;

const MAKES = {
  acura: "acura",
  audi: "audi",
  bmw: "bmw",
  buick: "buick",
  cadillac: "cadillac",
  chevrolet: "chevrolet",
  chevy: "chevrolet",
  chrysler: "chrysler",
  dodge: "dodge",
  ford: "ford",
  gmc: "gmc",
  honda: "honda",
  hyundai: "hyundai",
  infiniti: "infiniti",
  jeep: "jeep",
  kia: "kia",
  lexus: "lexus",
  lincoln: "lincoln",
  mazda: "mazda",
  mercedes: "mercedes-benz",
  "mercedes-benz": "mercedes-benz",
  mitsubishi: "mitsubishi",
  nissan: "nissan",
  ram: "ram",
  subaru: "subaru",
  tesla: "tesla",
  toyota: "toyota",
  volkswagen: "volkswagen",
  vw: "volkswagen",
  volvo: "volvo",
};

export function asset(path) {
  const base = import.meta.env.BASE_URL || "/";
  return base + String(path).replace(/^\//, "");
}

export function formatNum(value) {
  return Number(value || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function sortListings(list, mode) {
  const copy = list.slice();
  const title = (item) => (item.title || "").toLowerCase();
  if (mode === "za") copy.sort((a, b) => title(b).localeCompare(title(a)));
  else if (mode === "oldest") copy.sort((a, b) => a.year - b.year || title(a).localeCompare(title(b)));
  else if (mode === "az") copy.sort((a, b) => title(a).localeCompare(title(b)));
  else copy.sort((a, b) => b.year - a.year || title(a).localeCompare(title(b)));
  return copy;
}

export function matchesEra(item, era) {
  const year = item.year || 0;
  if (era === "all") return true;
  if (era === "older") return year > 0 && year < 1990;
  if (era === "2020") return year >= 2020;
  const start = Number(era);
  return year >= start && year < start + 10;
}

function normalizeMovie(item) {
  const yearMatch = String(item.Year || "").match(/\d{4}/);
  return {
    kind: "movie",
    id: item.imdbID,
    title: item.Title || "Untitled",
    year: yearMatch ? Number(yearMatch[0]) : 0,
    yearLabel: item.Year || "",
    photo: item.Poster && item.Poster !== "N/A" ? item.Poster : "",
    price: 0,
  };
}

async function fetchOmdb(params) {
  const url = new URL(OMDB_URL);
  url.searchParams.set("apikey", OMDB_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return response.json();
}

export async function searchMovies(query) {
  const term = query.trim();
  if (term.toLowerCase() === "fast") return fetchFastMovies();
  return fetchMovieSearch(term || "star");
}

async function fetchMovieSearch(term) {
  const payload = await fetchOmdb({ s: term, type: "movie", page: "1" });
  if (payload.Response === "False" || !Array.isArray(payload.Search)) return [];
  return payload.Search.map(normalizeMovie);
}

async function fetchFastMovies() {
  const matches = [];
  for (let page = 1; page <= 3 && matches.length < MOVIE_LIMIT; page += 1) {
    const payload = await fetchOmdb({ s: "fast", type: "movie", page: String(page) });
    const results = Array.isArray(payload.Search) ? payload.Search : [];
    results.forEach((item) => {
      const title = item.Title || "";
      if (matches.length < MOVIE_LIMIT && title.toLowerCase().startsWith("fast")) matches.push(normalizeMovie(item));
    });
    if (payload.Response === "False" || results.length < 10) break;
  }
  return matches;
}

export async function fetchMovie(id) {
  const details = await fetchOmdb({ i: id, plot: "full" });
  if (details.Response === "False") throw new Error(details.Error || "Movie not found");
  const yearMatch = String(details.Year || "").match(/\d{4}/);
  return {
    id: details.imdbID,
    title: details.Title || "Untitled",
    year: yearMatch ? Number(yearMatch[0]) : 0,
    yearLabel: details.Year || "",
    rated: details.Rated && details.Rated !== "N/A" ? details.Rated : "",
    runtime: details.Runtime && details.Runtime !== "N/A" ? details.Runtime : "",
    genre: details.Genre && details.Genre !== "N/A" ? details.Genre : "",
    director: clean(details.Director),
    actors: clean(details.Actors),
    plot: clean(details.Plot),
    rating: clean(details.imdbRating),
    votes: clean(details.imdbVotes),
    ratings: Array.isArray(details.Ratings) ? details.Ratings.filter((entry) => entry.Value && entry.Value !== "N/A") : [],
    language: clean(details.Language),
    country: clean(details.Country),
    awards: clean(details.Awards),
    boxOffice: clean(details.BoxOffice),
    writer: clean(details.Writer),
    genres: clean(details.Genre).split(",").map((part) => part.trim()).filter(Boolean),
    photo: clean(details.Poster),
  };
}

function clean(value) {
  return value && value !== "N/A" ? value : "";
}

export async function fetchRelated(movie) {
  const words = String(movie.title || "")
    .split(":")[0]
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["the", "and", "for", "with"].includes(word.toLowerCase()));
  const term = words.slice(0, 2).join(" ") || movie.genres?.[0] || "movie";
  const payload = await fetchOmdb({ s: term, type: "movie", page: "1" });
  if (payload.Response === "False" || !Array.isArray(payload.Search)) return [];
  return payload.Search.map(normalizeMovie).filter((item) => item.id && item.id !== movie.id).slice(0, 4);
}

export function carParams(query, priceMin, priceMax) {
  const params = new URLSearchParams();
  params.set("rows", "6");
  params.set("inventory_type", "used");
  params.set("miles_range", "1000-250000");
  params.set("price_range", `${priceMin}-${priceMax}`);
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const year = tokens.find((token) => /^\d{4}$/.test(token));
  const words = tokens.filter((token) => token !== year);
  if (year) params.set("year", year);
  if (!words.length) return params;
  const make = MAKES[words[0]];
  if (make) {
    params.set("make", make);
    if (words.length > 1) params.set("model", words.slice(1).join("-"));
  } else {
    params.set("model", words.join("-"));
  }
  return params;
}

function normalizeCar(item) {
  const build = item.build || {};
  const photos = item.media && Array.isArray(item.media.photo_links) ? item.media.photo_links : [];
  const price = Number(item.price) || 0;
  const reference = Number(item.ref_price) || Number(item.msrp) || 0;
  const year = build.year || item.year || "";
  const make = build.make || item.make || "";
  const model = build.model || item.model || "";
  return {
    kind: "car",
    id: item.id,
    vin: item.vin || "",
    year: Number(year) || 0,
    make,
    model,
    title: item.title || [year, make, model].filter(Boolean).join(" "),
    miles: Number(item.miles) || 0,
    body: build.body_type || item.body_type || item.body || "",
    transmission: build.transmission || item.transmission || "",
    price,
    previous: reference > price ? reference : item.previous || 0,
    photo: item.photo || photos.find((link) => link) || "",
    dealer: item.dealer || {},
  };
}

let savedCars;

async function loadSavedCars() {
  if (savedCars) return savedCars;
  const response = await fetch(asset("data/cars.json"));
  if (!response.ok) throw new Error("Request failed");
  savedCars = await response.json();
  return savedCars;
}

function filterSavedCars(cars, query, priceMin, priceMax) {
  const params = carParams(query, priceMin, priceMax);
  const make = (params.get("make") || "").toLowerCase();
  const model = (params.get("model") || "").replace(/-/g, " ").toLowerCase();
  const year = Number(params.get("year")) || 0;
  return cars
    .map(normalizeCar)
    .filter((car) => {
      if (car.price < priceMin || car.price > priceMax) return false;
      if (make && (car.make || "").toLowerCase() !== make) return false;
      if (model && !`${car.model} ${car.title}`.toLowerCase().includes(model)) return false;
      if (year && car.year !== year) return false;
      return true;
    })
    .slice(0, 6);
}

export async function searchCars(query, priceMin, priceMax) {
  try {
    const params = carParams(query, priceMin, priceMax);
    const response = await fetch(`${asset("api/cars")}?${params}`);
    if (response.ok) {
      const payload = await response.json();
      const listings = Array.isArray(payload.listings) ? payload.listings : [];
      const cars = listings.map(normalizeCar).filter((car) => car.price > 0);
      if (cars.length) return cars;
    }
  } catch (error) {
    // The published site has no car-api proxy, so the saved catalog is used.
  }
  const saved = await loadSavedCars();
  return filterSavedCars(saved, query, priceMin, priceMax);
}

export async function fetchVin(vin) {
  const response = await fetch(asset(`api/vin/${encodeURIComponent(vin)}`));
  if (!response.ok) return null;
  return response.json();
}
