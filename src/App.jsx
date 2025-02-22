import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import UserProfile from './pages/Profile';
import Repositories from './pages/Repositories';
import Followers from './pages/Followers';
import Header from './components/Header';

function App() {
  return (
    <div className="bg-zinc-800 flex flex-col min-h-screen min-w-screen w-full relative pb-12">
      <Header />
      <div className="pt-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/user/:username/repos/:page?/:sort?" element={<Repositories />} />
          <Route path="/user/:username/followers/:page?" element={<Followers />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
