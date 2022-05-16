/** ***** Import React and Dongles *******/
import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Signer } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

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

import Sidebar from './components/Sidebar/Sidebar';

// import { connectWallet } from './connectWallet';
import { useProvider } from './useProvider';
import { contractAddresses, getTokenBalanceDisplay } from '@crocswap-libs/sdk';


/** ***** React Function *******/
export default function App() {
    const { chainId, isWeb3Enabled, account } = useMoralis();
    const provider = useProvider(chainId as string);

    const [nativeBalance, setNativeBalance] = useState<string>('');

    // TODO: abstract this function to the 'connectWallet file', might
    // TODO: ... make sense to change it to 'useWallet' and put the
    // TODO: ... useEffect that calls it there as well
    // function to connect a user's wallet
    async function connectWallet(provider: Signer) {
        let nativeEthBalance = null;
        if (isWeb3Enabled && account !== null) {
            // this conditional is important because it prevents a TS error
            // ... in assigning the value of the key 'chain' below
            if (!!chainId && chainId === '0x2a') {
                // function to pull back all token balances from users wallet
                // const tokens = await Moralis.Web3API.account.getTokenBalances({
                //     chain: chainId,
                //     address: account,
                // });
                // function to pull back native token balance from wallet
                nativeEthBalance = await getTokenBalanceDisplay(
                    contractAddresses.ZERO_ADDR,
                    account,
                    provider,
                );
                // TODO: write code to marry nativeEthBalance into the array
                // TODO: ... of other balances and return all
                return nativeEthBalance;
            }
        }
    }

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            // run function pull back all balances in wallet
            const balance = await connectWallet(provider as Signer);
            // make sure a balance was returned, initialized as null
            if (balance) {
                // send value to local state
                setNativeBalance(balance);
            }
        })();
    }, [chainId, account]);

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
    };

    // props for <Swap/> React element
    const swapProps = {
        provider: provider as JsonRpcProvider,
    };

    // console.log({ provider });
    return (
        <>
            <div className='content-container'>
               <PageHeader {...headerProps} />
                <Sidebar />
                  <div className='main-layout'>
                     <Routes>
                    <Route index element={<Home />} />
                    <Route path='trade' element={<Trade />}>
                        <Route path='market' element={<Market />} />
                        <Route path='limit' element={<Limit />} />
                        <Route path='liquidity' element={<Liquidity />} />
                    </Route>
                    <Route path='analytics' element={<Analytics />} />
                    <Route path='portfolio' element={<Portfolio />} />
                    <Route path='swap' element={<Swap {...swapProps} />} />
                    <Route path='chart' element={<Chart />} />
                    <Route path='testpage' element={<TestPage />} />
                </Routes>
            </div>
        </div>
            <PageFooter />
        </>
    );
}
