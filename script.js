const CAR_API = "/api/cars";
const OMDB_URL = "https://www.omdbapi.com/";
const OMDB_KEY = "4cfe7eb4";
const MOVIE_LIMIT = 6;
const PRICE_MAX = 100000;
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
  volvo: "volvo"
};

document.querySelectorAll(".btn-contact, .showMenu a").forEach((link) => {
  const label = link.textContent.trim().toLowerCase();
  if (!link.classList.contains("btn-contact") && label !== "contact") return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    alert("This feature has not been implemented.");
  });
});

const bento = document.querySelector(".bento-menu");
const phoneMenu = document.querySelector(".showMenu");
const phoneClose = document.querySelector(".close-btn");
if (bento && phoneMenu && phoneClose) {
  bento.addEventListener("click", () => {
    phoneMenu.classList.add("active");
    phoneClose.classList.add("show");
    bento.classList.add("hide-anim-out");
  });
  phoneClose.addEventListener("click", () => {
    phoneClose.classList.remove("show");
    window.setTimeout(() => {
      phoneMenu.classList.remove("active");
      bento.classList.remove("hide-anim-out");
      bento.classList.add("show-anim-in");
    }, 700);
  });
}

const homeQuery = document.querySelector("#landing-page input");
const homeSearch = document.querySelector("#landing-page button");
if (homeQuery && homeSearch) {
  const go = () => {
    const query = homeQuery.value.trim();
    window.location.href = query ? `findyourcar.html?q=${encodeURIComponent(query)}` : "findyourcar.html";
  };
  homeSearch.addEventListener("click", go);
  homeQuery.addEventListener("keydown", (event) => {
    if (event.key === "Enter") go();
  });
}

const browseQuery = document.querySelector(".input-wrap input");
if (browseQuery) {
  const browseSearch = document.querySelector(".search-wrapper");
  const heading = document.querySelector("h1.search-info");
  const catalogEl = document.querySelector("#cars .content-wrapper");
  const loadingBar = document.querySelector(".md-progress-bar");
  const priceHeading = document.querySelector(".price-filter h2");
  const runway = document.querySelector(".el-slider__runway");
  const sliderBar = document.querySelector(".el-slider__bar");
  const handles = document.querySelectorAll(".el-slider__button-wrapper");
  const handleMin = handles[0];
  const handleMax = handles[1];
  const sortSelect = document.querySelector("#sort-filter");

  let catalog = [];
  let hasSearched = false;
  let requestToken = 0;
  let priceMin = 0;
  let priceMax = PRICE_MAX;

  browseSearch.addEventListener("click", () => search(browseQuery.value));
  browseQuery.addEventListener("keydown", (event) => {
    if (event.key === "Enter") search(browseQuery.value);
  });
  bindHandle(handleMin, "min");
  bindHandle(handleMax, "max");
  if (sortSelect) sortSelect.addEventListener("change", render);

  const initial = new URLSearchParams(window.location.search).get("q");
  if (initial) browseQuery.value = initial;
  search(initial || "");

  function bindHandle(handle, which) {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handle.classList.add("dragging");
      const move = (moveEvent) => updateFromPointer(moveEvent.clientX, which);
      const up = () => {
        handle.classList.remove("dragging");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (hasSearched) search(browseQuery.value);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  function updateFromPointer(clientX, which) {
    const rect = runway.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const stepped = Math.round((ratio * PRICE_MAX) / 1000) * 1000;
    if (which === "min") priceMin = Math.min(stepped, priceMax);
    else priceMax = Math.max(stepped, priceMin);
    paintSlider();
    render();
  }

  function paintSlider() {
    const left = (priceMin / PRICE_MAX) * 100;
    const right = (priceMax / PRICE_MAX) * 100;
    sliderBar.style.left = `${left}%`;
    sliderBar.style.width = `${right - left}%`;
    handleMin.style.left = `${left}%`;
    handleMax.style.left = `${right}%`;
    priceHeading.innerHTML = `<span data-v-66aecfa2 class="black-txt" style="margin-right: 8px;">Price range:</span> $${formatNum(priceMin)} to $${formatNum(priceMax)} `;
  }

  function formatNum(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function resetFilters() {
    browseQuery.value = "";
    priceMin = 0;
    priceMax = PRICE_MAX;
    paintSlider();
    history.replaceState(null, "", "findyourcar.html");
    search("");
  }

  async function search(rawQuery) {
    const query = rawQuery.trim();
    const token = ++requestToken;
    hasSearched = true;
    heading.innerHTML = query
      ? `<span data-v-66aecfa2 class="black-txt">Search results for</span> <span style="text-transform: capitalize;">"${escapeHtml(query)}"</span>`
      : '<span data-v-66aecfa2 class="black-txt">Search results:</span>';
    setLoading(true);
    catalogEl.replaceChildren(loadingNode());
    try {
      const found = query.toLowerCase() === "fast" ? await fetchFastMovies() : await fetchCars(query);
      if (token !== requestToken) return;
      catalog = found;
      render();
    } catch (error) {
      if (token !== requestToken) return;
      catalog = [];
      catalogEl.replaceChildren(emptyNode());
    } finally {
      if (token === requestToken) setLoading(false);
    }
  }

  async function fetchFastMovies() {
    const matches = [];
    for (let page = 1; page <= 3 && matches.length < MOVIE_LIMIT; page += 1) {
      const url = new URL(OMDB_URL);
      url.searchParams.set("apikey", OMDB_KEY);
      url.searchParams.set("s", "fast");
      url.searchParams.set("type", "movie");
      url.searchParams.set("page", String(page));
      const response = await fetch(url);
      if (!response.ok) throw new Error("Request failed");
      const payload = await response.json();
      const results = Array.isArray(payload.Search) ? payload.Search : [];
      results.forEach((item) => {
        const title = item.Title || "";
        if (matches.length < MOVIE_LIMIT && title.toLowerCase().startsWith("fast")) matches.push(normalizeMovie(item));
      });
      if (payload.Response === "False" || results.length < 10) break;
    }
    return matches;
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
      price: 0
    };
  }

  async function fetchCars(query) {
    const params = carParams(query);
    const response = await fetch(`${CAR_API}?${params}`);
    if (!response.ok) throw new Error("Request failed");
    const payload = await response.json();
    const listings = Array.isArray(payload.listings) ? payload.listings : [];
    return listings.map(normalizeCar).filter((car) => car.price > 0);
  }

  function carParams(query) {
    const params = new URLSearchParams();
    params.set("rows", "18");
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
      id: item.id,
      vin: item.vin || "",
      year: Number(year) || 0,
      make,
      model,
      title: [year, make, model].filter(Boolean).join(" "),
      miles: Number(item.miles) || 0,
      body: build.body_type || item.body_type || "",
      transmission: build.transmission || item.transmission || "",
      price,
      previous: reference > price ? reference : 0,
      photo: photos.find((link) => link) || "",
      dealer: item.dealer || {}
    };
  }

  function setLoading(isLoading) {
    if (loadingBar) loadingBar.style.display = isLoading ? "block" : "none";
  }

  function render() {
    if (!hasSearched) return;
    const visible = sortMovies(catalog.filter(inPriceRange));
    catalogEl.replaceChildren();
    if (!visible.length) {
      catalogEl.append(emptyNode());
      return;
    }
    visible.forEach((movie) => catalogEl.append(createCard(movie)));
  }

  function sortMovies(list) {
    const mode = sortSelect ? sortSelect.value : "az";
    const copy = list.slice();
    const title = (car) => (car.title || "").toLowerCase();
    if (mode === "za") copy.sort((a, b) => title(b).localeCompare(title(a)));
    else if (mode === "newest") copy.sort((a, b) => b.year - a.year || title(a).localeCompare(title(b)));
    else if (mode === "oldest") copy.sort((a, b) => a.year - b.year || title(a).localeCompare(title(b)));
    else copy.sort((a, b) => title(a).localeCompare(title(b)));
    return copy;
  }

  function inPriceRange(car) {
    if (car.kind === "movie") return true;
    return car.price >= priceMin && car.price <= priceMax;
  }

  function scoped(node) {
    node.setAttribute("data-v-ca62299c", "");
    return node;
  }

  function createCard(car) {
    const wrap = scoped(document.createElement("div"));
    wrap.className = "card-wrapper";
    const card = scoped(document.createElement("div"));
    card.className = "card";
    const top = scoped(document.createElement("div"));
    top.className = "top";
    const image = scoped(document.createElement("img"));
    image.alt = "";
    image.src = car.photo || "img/carpark.8742e246.jpeg";
    image.addEventListener("error", () => {
      image.src = "img/carpark.8742e246.jpeg";
    });
    const view = scoped(document.createElement("div"));
    view.className = "view-car";
    view.innerHTML = '<span style="margin-right: 8px;">More info</span><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-arrow-right fa-w-14" style="font-size: 24px;"><path fill="currentColor" d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path></svg>';
    top.append(image, view);
    const bot = scoped(document.createElement("div"));
    bot.className = "bot";
    const title = scoped(document.createElement("div"));
    title.className = "title";
    title.textContent = car.title || "Untitled";
    if (car.kind === "movie") {
      bot.append(title, infoRow("car-side", car.yearLabel || "Year unknown"), infoRow("cogs", "Movie"));
    } else {
      bot.append(
        title,
        infoRow("tachometer-alt", car.miles ? `${formatNum(car.miles)} mi` : "Mileage unavailable"),
        infoRow("car-side", car.body || "Body unknown"),
        infoRow("cogs", car.transmission || "Transmission unknown")
      );
    }
    const foot = document.createElement("div");
    foot.className = "flex justify-between";
    foot.style.marginTop = "30px";
    const price = scoped(document.createElement("h2"));
    price.className = "price";
    if (car.kind !== "movie" && car.previous) {
      const was = scoped(document.createElement("span"));
      was.className = "prev";
      was.textContent = `$${formatNum(car.previous)}`;
      price.append(was);
    }
    const current = scoped(document.createElement("span"));
    current.className = "curr";
    current.textContent = car.kind === "movie" ? (car.yearLabel || "") : `$${formatNum(car.price)}`;
    price.append(current);
    foot.append(price);
    bot.append(foot);
    card.append(top, bot);
    card.addEventListener("click", () => openDetails(car));
    wrap.append(card);
    return wrap;
  }

  function infoRow(icon, text) {
    const row = scoped(document.createElement("span"));
    row.className = "car-info";
    const paths = {
      "tachometer-alt": ["0 0 576 512", "M288 32C128.94 32 0 160.94 0 320c0 52.8 14.25 102.26 39.06 144.8 5.61 9.62 16.3 15.2 27.44 15.2h443c11.14 0 21.83-5.58 27.44-15.2C561.75 422.26 576 372.8 576 320c0-159.06-128.94-288-288-288zm0 64c14.71 0 26.58 10.13 30.32 23.65-1.11 2.26-2.64 4.23-3.45 6.67l-9.22 27.67c-5.13 3.49-10.97 6.01-17.64 6.01-17.67 0-32-14.33-32-32S270.33 96 288 96zM96 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm48-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32zm246.77-72.41l-61.33 184C343.13 347.33 352 364.54 352 384c0 11.72-3.38 22.55-8.88 32H232.88c-5.5-9.45-8.88-20.28-8.88-32 0-33.94 26.5-61.43 59.9-63.59l61.34-184.01c4.17-12.56 17.73-19.45 30.36-15.17 12.57 4.19 19.35 17.79 15.17 30.36zm14.66 57.2l15.52-46.55c3.47-1.29 7.13-2.23 11.05-2.23 17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.38-.01-20.89-6.28-26.57-15.22zM480 384c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32 32z"],
      "car-side": ["0 0 640 512", "M544 192h-16L419.22 56.02A64.025 64.025 0 0 0 369.24 32H155.33c-26.17 0-49.7 15.93-59.42 40.23L48 194.26C20.44 201.4 0 226.21 0 256v112c0 8.84 7.16 16 16 16h48c0 53.02 42.98 96 96 96s96-42.98 96-96h128c0 53.02 42.98 96 96 96s96-42.98 96-96h48c8.84 0 16-7.16 16-16v-80c0-53.02-42.98-96-96-96zM160 432c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm72-240H116.93l38.4-96H232v96zm48 0V96h89.24l76.8 96H280zm200 240c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z"],
      cogs: ["0 0 640 512", "M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8z"]
    };
    const [viewBox, path] = paths[icon];
    row.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="${icon}" class="svg-inline--fa fa-${icon}" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" data-v-ca62299c><path fill="currentColor" d="${path}"></path></svg> ${escapeHtml(text)} `;
    return row;
  }

  function loadingNode() {
    const wrap = scoped(document.createElement("div"));
    wrap.className = "loading-state flex justify-center";
    wrap.innerHTML = '<svg data-v-cf78a876 data-v-ca62299c aria-hidden="true" focusable="false" data-prefix="fas" data-icon="spinner" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-spinner fa-w-16 fa-spin" style="font-size: 30px; color: rgb(96, 48, 177);"><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>';
    return wrap;
  }

  function emptyNode() {
    const wrap = scoped(document.createElement("div"));
    wrap.className = "empty-state flex flex-col align-center";
    wrap.innerHTML = '<img data-v-ca62299c src="img/filters.68be3816.svg" alt=""><h1 data-v-ca62299c>Could not find any matches related to your search.</h1><span data-v-ca62299c>Please change the filter or reset it below.</span><button data-v-ca62299c type="button">Reset filter</button>';
    wrap.querySelector("button").addEventListener("click", resetFilters);
    return wrap;
  }

  async function openDetails(car) {
    document.querySelectorAll(".v-modal, .el-dialog__wrapper").forEach((node) => node.remove());
    const modal = document.createElement("div");
    modal.className = "v-modal";
    modal.style.zIndex = "2000";
    const wrapper = document.createElement("div");
    wrapper.className = "el-dialog__wrapper";
    wrapper.style.zIndex = "2001";
    wrapper.innerHTML = '<div class="el-dialog" style="margin-top: 15vh; width: 640px;"><div class="el-dialog__header"><span class="el-dialog__title">Loading…</span><button type="button" class="el-dialog__headerbtn" aria-label="Close"><i class="el-dialog__close el-icon el-icon-close"></i></button></div><div class="el-dialog__body"></div></div>';
    document.body.append(modal, wrapper);
    const close = () => {
      modal.remove();
      wrapper.remove();
    };
    wrapper.querySelector(".el-dialog__headerbtn").addEventListener("click", close);
    modal.addEventListener("click", close);
    const body = wrapper.querySelector(".el-dialog__body");
    body.style.whiteSpace = "pre-line";
    wrapper.querySelector(".el-dialog__title").textContent = car.title;
    if (car.kind === "movie") {
      body.textContent = car.yearLabel || "";
      try {
        const url = new URL(OMDB_URL);
        url.searchParams.set("apikey", OMDB_KEY);
        url.searchParams.set("i", car.id);
        url.searchParams.set("plot", "short");
        const response = await fetch(url);
        if (!response.ok) return;
        const details = await response.json();
        if (details.Response === "False") return;
        const facts = [details.Year, details.Runtime, details.Genre, details.imdbRating && details.imdbRating !== "N/A" ? `${details.imdbRating} / 10` : ""]
          .filter((part) => part && part !== "N/A")
          .join(" · ");
        const plot = details.Plot && details.Plot !== "N/A" ? details.Plot : "";
        body.textContent = [facts, plot].filter(Boolean).join("\n\n");
      } catch (error) {
        return;
      }
      return;
    }
    const dealer = [car.dealer.name, car.dealer.city, car.dealer.state].filter(Boolean).join(", ");
    const lines = [
      `$${formatNum(car.price)}`,
      car.miles ? `${formatNum(car.miles)} mi` : "",
      car.body,
      car.transmission,
      dealer
    ].filter(Boolean);
    body.textContent = lines.join("\n");
    if (!car.vin) return;
    try {
      const response = await fetch(`/api/vin/${encodeURIComponent(car.vin)}`);
      if (!response.ok) return;
      const specs = await response.json();
      const extra = [specs.engine, specs.drivetrain, specs.fuel_type, specs.city_mpg && `${specs.city_mpg} city / ${specs.highway_mpg} hwy mpg`]
        .filter(Boolean)
        .join(" · ");
      if (extra) body.textContent = `${lines.join("\n")}\n\n${extra}`;
    } catch (error) {
      return;
    }
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
}
