import './App.css'
import Swiper from './components/swiper/'
import Matches from './components/matches/'
import Upload from './components/upload/'
import Settings from './components/settings/'

import {
  createBrowserRouter,
  Link,
  Routes,
  Route,
  RouterProvider,
} from "react-router-dom";

const Skeleton = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Swiper/>}/>
        <Route path="/matches" element={<Matches />}/>
        <Route path="/upload" element={<Upload />}/>
        <Route path="/settings" element={<Settings />}/>
      </Routes>
      <nav>
        {/* TODO: icon */}
        <label>
          <input type="button" value="Menu" />
        </label>
        <Link to={'/'}>Batch</Link>
        <Link to={'/matches'}>Matches</Link>
        <Link to={'/upload'}>Upload</Link>
        <Link to={'/settings'}>Settings</Link>
      </nav>
    </main>
)}

const router = createBrowserRouter([
  {path: '*', element: <Skeleton />}
]);

function App() {
  return <RouterProvider router={router} />
}

export default App
