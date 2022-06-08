/** ***** Import React and Dongles *******/
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { setPositionsByUser } from '../utils/state/graphDataSlice';
import {
    // Signer,
    utils,
    ethers,
} from 'ethers';

import { request, gql } from 'graphql-request';

import { Routes, Route, useLocation } from 'react-router-dom';
import { useMoralis, useMoralisQuery, useMoralisSubscription } from 'react-moralis';
import Moralis from 'moralis/types';

import { JsonRpcProvider } from '@ethersproject/providers';
import {
    contractAddresses,
    getTokenBalanceDisplay,
    // queryPos,
} from '@crocswap-libs/sdk';

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
// import initializeLocalStorage from './functions/initializeLocalStorage';
import { fetchTokenLists } from './functions/fetchTokenLists';
import { validateChain } from './validateChain';
import { IParsedPosition, parsePositionArray } from './parsePositions';
import { kovanETH, kovanDAI, kovanUSDC } from '../utils/data/defaultTokens';
import { useLocalStorage } from '../utils/hooks/useLocalStorage';

/** ***** React Function *******/
export default function App() {
    const { chainId, isWeb3Enabled, account, logout, isAuthenticated } = useMoralis();

    console.log(localStorage.isAppInitialized);
    console.assert(localStorage.getItem('isAppInitialized'), 'not initialized!');
    localStorage.setItem('isAppInitialized', 'true');

    useEffect(() => {
        if (localStorage.allTokenLists) {
            const allTokenLists = fetchTokenLists();
        }
    }, []);

    // 1. check if all token lists are in local storage
    // 2. if yes, do nothing
    // 3. if no, fetch token lists and send to local storage

    // const defaultTks = {kovanETH, kovanDAI, kovanUSDC};

    // const [importedTokens, setImportedTokens] = useLocalStorage('importedTokens', JSON.stringify(defaultTks));

    const importedTokens = [kovanDAI, kovanUSDC, kovanETH];

    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const location = useLocation();

    const dispatch = useAppDispatch();

    const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);
    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    useEffect(() => {
        (async () => {
            if (window.ethereum) {
                const metamaskAccounts = await window.ethereum.request({ method: 'eth_accounts' });
                // console.log({ metamaskAccounts });
                if (metamaskAccounts?.length > 0) {
                    setMetamaskLocked(false);
                } else {
                    setMetamaskLocked(true);
                }
            }
        })();
    }, [window.ethereum, account]);

    const graphData = useAppSelector((state) => state.graphData);

    useEffect(() => {
        if (account) {
            const endpoint = 'https://api.thegraph.com/subgraphs/name/a0910841082130913312/croc22';
            const query = gql`
                query ($userAddress: Bytes) {
                    user(id: $userAddress) {
                        id
                        positions {
                            id
                            pool {
                                id
                                base
                                quote
                                poolIdx
                            }
                            ambient
                            bidTick
                            askTick
                        }
                    }
                }
            `;
            const variables = {
                userAddress: account,
            };
            request(
                endpoint,
                query,
                variables,
                // requestHeaders: headers,
            ).then((data) => {
                if (JSON.stringify(graphData.positionsByUser) !== JSON.stringify(data.user)) {
                    dispatch(setPositionsByUser(data.user));
                }
            });
        }
    }, [account, lastBlockNumber]);

    // run function to initialize local storage
    // internal controls will only initialize values that don't exist
    // existing values will not be overwritten

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
        if (currentLocation === '/' || currentLocation === '/swap') {
            setShowSidebar(false);
        }
    }

    useEffect(() => {
        toggleSidebarBasedOnRoute();
    }, [location]);

    const [provider, setProvider] = useState<ethers.providers.JsonRpcProvider>();

    // useEffect(() => {
    //     console.log({ provider });
    // }, [provider]);

    useEffect(() => {
        try {
            if (provider && provider.connection?.url === 'metamask' && !metamaskLocked) {
                return;
                // console.log('metamask connected and unlocked');
            } else if (provider && provider.connection?.url === 'metamask' && metamaskLocked) {
                clickLogout();
            } else if (window.ethereum && !metamaskLocked) {
                const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(metamaskProvider);
            } else if (provider) {
                return;
            } else {
                // console.log('making new kovan speedy node provider');
                setProvider(
                    new ethers.providers.JsonRpcProvider(
                        'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/kovan',
                    ),
                );
            }
        } catch (error) {
            console.log(error);
        }

        // const newProvider = useProvider(provider, setProvider, chainId as string);
    }, [chainId, provider, metamaskLocked]);

    const [nativeBalance, setNativeBalance] = useState<string>('');

    const [posArray, setPosArray] = useState<Moralis.Object<Moralis.Attributes>[]>();
    const [parsedPositionArray, setParsedPositionArray] = useState<IParsedPosition[]>();

    useMoralisSubscription(
        'UserPosition',
        (query) => query.equalTo('account', account).limit(1000),
        [account],
        {
            // onCreate: (data) => console.log({ data }),
            onCreate: (data) => {
                if (data && posArray) {
                    const newPosArray = [...posArray, data];
                    setPosArray(newPosArray);
                }
            },
        },
    );

    const { data } = useMoralisQuery(
        'UserPosition',
        (query) => query.equalTo('account', account).limit(1000),
        [account],
        { autoFetch: true },
    );

    // useEffect to dispatch new position data to local state when
    // when the moralis query returns different data
    useEffect(() => {
        if (data) {
            setPosArray(data);
        }
    }, [data, account]);

    // useEffect to console log for dev purposes
    useEffect(() => {
        if (provider && posArray && posArray?.length > 0) {
            parsePositionArray(
                posArray,
                provider,
                setParsedPositionArray as React.Dispatch<React.SetStateAction<IParsedPosition[]>>,
            );
        }
    }, [posArray]);

    // useEffect to console log for dev purposes
    useEffect(() => {
        if (parsedPositionArray && parsedPositionArray?.length > 0) {
            console.log({ parsedPositionArray });
        }
    }, [parsedPositionArray]);

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => {
        setNativeBalance('');
        await logout();
    };

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account
                // && isAuthenticated && provider.connection?.url === 'metamask'
            ) {
                const signer = provider.getSigner();
                const nativeEthBalance = await getTokenBalanceDisplay(
                    contractAddresses.ZERO_ADDR,
                    account,
                    signer,
                );
                // make sure a balance was returned, initialized as null
                if (nativeEthBalance) {
                    // send value to local state
                    setNativeBalance(nativeEthBalance);
                }
            }
            // console.log({ balance });
        })();
    }, [chainId, account, isWeb3Enabled, isAuthenticated]);

    const [gasPriceinGwei, setGasPriceinGwei] = useState<string>('');

    useEffect(() => {
        (async () => {
            if (provider) {
                const gasPriceInWei = await provider.getGasPrice();
                if (gasPriceInWei)
                    setGasPriceinGwei(utils.formatUnits(gasPriceInWei.toString(), 'gwei'));
            }
        })();
    }, [provider, chainId, lastBlockNumber]);

    // useEffect to get current block number
    // on a 3 second interval
    // currently displayed in footer
    useEffect(() => {
        if (provider) {
            const interval = setInterval(async () => {
                const currentBlock = await provider.getBlockNumber();
                if (currentBlock !== lastBlockNumber) {
                    setLastBlockNumber(currentBlock);
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [provider, chainId, lastBlockNumber]);

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
        clickLogout: clickLogout,
        metamaskLocked: metamaskLocked,
    };

    // props for <Swap/> React element
    const swapProps = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
    };

    // props for <Limit/> React element
    const limitProps = {
        importedTokens: importedTokens,
    };

    // props for <Range/> React element
    const rangeProps = {
        importedTokens: importedTokens,
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
    // take away margin from left if we are on homepage or swap
    const noSidebarStyle =
        currentLocation == '/' || currentLocation == '/swap' ? 'no-sidebar' : mainLayoutStyle;
    const swapBodyStyle = currentLocation == '/swap' ? 'swap-body' : null;

    return (
        <>
            <div className='content-container'>
                <PageHeader {...headerProps} />
                {currentLocation !== '/' && currentLocation !== '/swap' && (
                    <Sidebar {...sidebarProps} />
                )}
                <div className={`${noSidebarStyle} ${swapBodyStyle}`}>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route path='trade' element={<Trade />}>
                            <Route path='' element={<Swap {...swapPropsTrade} />} />
                            <Route path='market' element={<Swap {...swapPropsTrade} />} />
                            <Route path='limit' element={<Limit {...limitProps} />} />
                            <Route path='range' element={<Range {...rangeProps} />} />
                        </Route>
                        <Route path='analytics' element={<Analytics />} />
                        <Route path='range2' element={<Range {...rangeProps} />} />
                        <Route path='account' element={<Portfolio />} />
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
