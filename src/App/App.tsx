/** ***** Import React and Dongles *******/
import { Routes, Route } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Signer } from 'ethers';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Trade from '../pages/Trade/Trade';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Market from '../pages/Trade/Market/Market';
import Limit from '../pages/Trade/Limit/Limit';
import Liquidity from '../pages/Trade/Liquidity/Liquidity';
import Swap from '../pages/Swap/Swap';
import Chart from '../pages/Chart/Chart';
import TestPage from '../pages/TestPage/TestPage';

/** * **** Import Local Files *******/
import './App.css';
import { useWallet } from './useWallet';
import { useProvider } from './useProvider';
import { useState } from 'react';

/** ***** React Function *******/
export default function App() {
    const { chainId } = useMoralis();
    const provider = useProvider(chainId as string);
    console.log(provider);

    const [nativeBalance, setNativeBalance] = useState('');

    (async () => {
        const balance = await useWallet(provider as Signer);
        if (typeof balance === 'string') {
            setNativeBalance(balance);
        }
    })();

    const headerProps = {
        nativeBalance: nativeBalance,
    };

    return (
        <>
            <div className='content-container'>
                <PageHeader {...headerProps} />
                <Routes>
                    <Route index element={<Home />} />
                    <Route path='trade' element={<Trade />}>
                        <Route path='market' element={<Market />} />
                        <Route path='limit' element={<Limit />} />
                        <Route path='liquidity' element={<Liquidity />} />
                    </Route>
                    <Route path='analytics' element={<Analytics />} />
                    <Route path='portfolio' element={<Portfolio />} />
                    <Route path='swap' element={<Swap />} />
                    <Route path='chart' element={<Chart />} />
                    <Route path='testpage' element={<TestPage />} />
                </Routes>
            </div>
            <PageFooter />
        </>
    );
}
