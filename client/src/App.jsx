import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Gangs from "./pages/Gangs.jsx";
import { Episodes, Contestants, Eliminations, Auditions } from "./pages/Sections.jsx";
import SuperFan from "./pages/SuperFan.jsx";
import SuperFanHub from "./pages/SuperFanHub.jsx";
import AllTimePoll from "./pages/AllTimePoll.jsx";
import Admin from "./pages/Admin.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="episodes" element={<Episodes />} />
        <Route path="contestants" element={<Contestants />} />
        <Route path="eliminations" element={<Eliminations />} />
        <Route path="gangs" element={<Gangs />} />
        <Route path="auditions" element={<Auditions />} />
        <Route path="super-fan" element={<SuperFanHub />} />
        <Route path="super-fan/roadies-rebirth" element={<SuperFan />} />
        <Route path="super-fan/all-time" element={<AllTimePoll />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
