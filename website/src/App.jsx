import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import AppDetails from './pages/AppDetails';
import Download from './pages/Download';
import Pricing from './pages/Pricing';
import Support from './pages/Support';

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/app-details" element={<AppDetails />} />
                <Route path="/download" element={<Download />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />
            </Routes>
        </Layout>
    );
}

export default App;
