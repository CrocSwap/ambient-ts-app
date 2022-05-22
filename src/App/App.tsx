/** ***** Import React and Dongles *******/
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { Signer, utils } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { contractAddresses, getTokenBalanceDisplay } from '@crocswap-libs/sdk';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Trade from '../pages/Trade/Trade';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
// import Market from '../pages/Trade/Market/Market';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import Chart from '../pages/Chart/Chart';
import TestPage from '../pages/TestPage/TestPage';

/** * **** Import Local Files *******/
import './App.css';
import { useProvider } from './useProvider';
import { fetchTokenLists } from './fetchTokenLists';
import { validateChain } from './validateChain';

/** ***** React Function *******/
export default function App() {
    const { chainId, isWeb3Enabled, account, logout, isAuthenticated } = useMoralis();
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const location = useLocation();

    // fetch token lists from URIs if none are in local storage
    if (!window.localStorage.allTokenLists) fetchTokenLists();

    // determine whether the user is connected to a supported chain
    // the user being connected to a non-supported chain or not being
    // ... connected at all are both reflected as `false`
    // later we can make this available to the rest of the app through
    // ... the React Router context provider API
    const isChainValid = chainId ? validateChain(chainId as string) : false;
    console.assert(true, isChainValid);

    const currentLocation = location.pathname;

    function toggleSidebarBasedOnRoute() {
        setShowSidebar(true);
        if (currentLocation === '/') {
            setShowSidebar(false);
        }
    }

    useEffect(() => {
        toggleSidebarBasedOnRoute();
    }, [location]);

    const provider = useProvider(chainId as string);

    const [nativeBalance, setNativeBalance] = useState<string>('');
    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    // TODO: abstract this function to the 'connectWallet file', might
    // TODO: ... make sense to change it to 'useWallet' and put the
    // TODO: ... useEffect that calls it there as well
    // function to connect a user's wallet
    async function connectWallet(provider: Signer) {
        let nativeEthBalance = null;
        if (isAuthenticated && isWeb3Enabled && account !== null) {
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

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => {
        setNativeBalance('');
        await logout();
    };

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            // run function pull back all balances in wallet
            // console.log('running connectWallet');
            const balance = await connectWallet(provider as Signer);
            // make sure a balance was returned, initialized as null
            if (balance) {
                // send value to local state
                setNativeBalance(balance);
            }
            // console.log({ balance });
        })();
    }, [chainId, account, isWeb3Enabled, isAuthenticated]);

    const [gasPriceinGwei, setGasPriceinGwei] = useState<string>('');

    useEffect(() => {
        (async () => {
            if (provider) {
                const gasPriceInWei = await (provider as JsonRpcProvider).getGasPrice();
                if (gasPriceInWei)
                    setGasPriceinGwei(utils.formatUnits(gasPriceInWei.toString(), 'gwei'));
            }
        })();
    }, [provider, chainId, lastBlockNumber]);

    // useEffect to get current block number
    // on a 1 second interval
    // currently displayed in footer
    useEffect(() => {
        if (provider) {
            const interval = setInterval(async () => {
                const currentBlock = await (provider as JsonRpcProvider).getBlockNumber();
                if (currentBlock !== lastBlockNumber) {
                    setLastBlockNumber(currentBlock);
                    // console.log(`current block number on ${chainId} : ${currentBlock}`);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [provider, chainId, lastBlockNumber]);

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
        clickLogout: clickLogout,
    };

    // props for <Swap/> React element

    const swapProps = {
        provider: provider as JsonRpcProvider,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
    };

    const swapPropsTrade = {
        provider: provider as JsonRpcProvider,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
    };

    // props for <Range/> React element
    const rangeProps = {
        provider: provider as JsonRpcProvider,
        lastBlockNumber: lastBlockNumber,
    };

    // props for <Sidebar/> React element
    function toggleSidebar() {
        setShowSidebar(!showSidebar);
    }
    const sidebarProps = {
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
    };

    const mainLayoutStyle = showSidebar ? 'main-layout-2' : 'main-layout';
    // console.log({ provider });

    return (
        <>
            <div className='content-container'>
                <PageHeader {...headerProps} />
                <Sidebar {...sidebarProps} />
                <div className={mainLayoutStyle}>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route path='trade' element={<Trade />}>
                            <Route path='' element={<Swap {...swapPropsTrade} />} />
                            <Route path='market' element={<Swap {...swapPropsTrade} />} />
                            <Route path='limit' element={<Limit />} />
                            <Route path='range' element={<Range {...rangeProps} />} />
                        </Route>
                        <Route path='analytics' element={<Analytics />} />
                        <Route path='range2' element={<Range {...rangeProps} />} />
                        <Route path='portfolio' element={<Portfolio />} />
                        <Route path='swap' element={<Swap {...swapProps} />} />
                        <Route path='chart' element={<Chart />} />
                        <Route path='testpage' element={<TestPage />} />
                    </Routes>
                </div>
            </div>
            <PageFooter lastBlockNumber={lastBlockNumber} />
        </>
    );
}
