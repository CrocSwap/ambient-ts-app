/******* Import React and Dongles *******/
import { Routes, Route } from 'react-router-dom';


/******* Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Trade from '../pages/Trade/Trade';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';


/******* Import Local Files *******/
import './App.css';


/******* React Function *******/
export default function App() {
  return (
    <>
      <PageHeader />
      <Routes>
        <Route index element={<Home />} />
        <Route path='trade' element={<Trade />}>

        </Route>
        <Route path='analytics' element={<Analytics />} />
        <Route path='portfolio' element={<Portfolio />} />
      </Routes>
      <PageFooter />
    </>
  );
}