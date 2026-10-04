import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import Cars from "./pages/Cars.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Contact from "./pages/Contact.jsx";
import CarDetails from "./pages/CarDetails.jsx";
import { WatchlistProvider } from "./watchlist.jsx";

export default function App() {
  return (
    <WatchlistProvider>
      <div id="app" data-v-5fdf2371="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </WatchlistProvider>
  );
}
