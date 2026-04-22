import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Brief } from './pages/Brief';
import { Churn } from './pages/Churn';
import { MRR } from './pages/MRR';
import { Overview } from './pages/Overview';
import { Revenue } from './pages/Revenue';
import { Subscribers } from './pages/Subscribers';
import { Trials } from './pages/Trials';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/mrr" element={<MRR />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/churn" element={<Churn />} />
          <Route path="/trials" element={<Trials />} />
          <Route path="/brief" element={<Brief />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
