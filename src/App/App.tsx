/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import {
    resetGraphData,
    setPositionsByPool,
    setPositionsByUser,
} from '../utils/state/graphDataSlice';
import { utils, ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { request, gql } from 'graphql-request';
import { useMoralis, useMoralisQuery, useMoralisSubscription } from 'react-moralis';
import Moralis from 'moralis/types';
import {
    contractAddresses,
    getTokenBalanceDisplay,
    sortBaseQuoteTokens,
    POOL_PRIMARY,
    getSpotPrice,
    getSpotPriceDisplay,
    getTokenAllowance,
} from '@crocswap-libs/sdk';

import { receiptData, resetReceiptData } from '../utils/state/receiptDataSlice';

import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import Chart from '../pages/Chart/Chart';
import Edit from '../pages/Trade/Edit/Edit';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { validateChain } from './validateChain';
import { IParsedPosition, parsePositionArray } from './parsePositions';
import { defaultTokens } from '../utils/data/defaultTokens';
import initializeUserLocalStorage from './functions/initializeUserLocalStorage';
import { TokenIF, TokenListIF } from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTradeData,
    setAdvancedHighTick,
    setAdvancedLowTick,
    setDenomInBase,
} from '../utils/state/tradeDataSlice';
import PositionDetails from '../pages/Trade/Range/PositionDetails';

/** ***** React Function *******/
export default function App() {
    const { chainId, isWeb3Enabled, account, logout, isAuthenticated } = useMoralis();

    const [ensName, setEnsName] = useState('');
    useEffect(() => {
        (async () => {
            const provider = new ethers.providers.JsonRpcProvider(
                'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/goerli',
            );
            if (account) {
                const name = await provider.lookupAddress(account);
                if (name) setEnsName(name);
                else setEnsName('');
            }
        })();
    }, [account]);

    const dispatch = useAppDispatch();

    const [importedTokens, setImportedTokens] = useState(defaultTokens);
    const [searchableTokens, setSearchableTokens] = useState(defaultTokens);

    useEffect(() => {
        console.log(searchableTokens);
    }, [searchableTokens]);

    // prevent multiple fetch requests to external URIs for token lists
    const [needTokenLists, setNeedTokenLists] = useState(true);

    // trigger a useEffect() which needs to run when new token lists are received
    // true vs false is an arbitrary distinction here
    const [tokenListsReceived, indicateTokenListsReceived] = useState(false);

    if (needTokenLists) {
        setNeedTokenLists(false);
        fetchTokenLists(tokenListsReceived, indicateTokenListsReceived);
    }

    useEffect(() => {
        initializeUserLocalStorage();
        getImportedTokens();
    }, [tokenListsReceived]);

    // update local state with searchable tokens once after initial load of app
    useEffect(() => {
        // pull activeTokenLists from local storage and parse
        // do we need to add gatekeeping in case there is not a valid value?
        const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);
        // update local state with array of all tokens from searchable lists
        setSearchableTokens(
            JSON.parse(localStorage.getItem('allTokenLists') as string)
                .filter((tokenList:TokenListIF) => activeTokenLists.includes(tokenList.uri))
                .map((tokenList:TokenListIF) => tokenList.tokens).flat()
        );
    }, []);

    // function getTokensFromLists(tokenListURIs:Array<TokenIF>) {
    //     const tokensFromLists = JSON.parse(localStorage.getItem('allTokenLists') as string)
    //         // .filter((tokenList:TokenListIF) => tokenListURIs.includes(tokenList.uri))
    //         // .map((tokenList:TokenListIF) => tokenList.tokens).flat();
    //     console.log(tokensFromLists);
    //     return tokensFromLists;
    // }

    function getImportedTokens() {
        // see if there's a user object in local storage
        if (localStorage.user) {
            // if user object exists, pull it
            const user = JSON.parse(localStorage.getItem('user') as string);
            // see if user object has a list of imported tokens
            if (user.importedTokens) {
                // if imported tokens are listed, hold in local state
                setImportedTokens(
                    user.importedTokens.filter(
                        (tkn: TokenIF) => tkn.chainId === parseInt(chainId ?? '0x2a'),
                    ),
                );
            }
        }
    }

    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const location = useLocation();

    const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);
    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    const tradeData = useAppSelector((state) => state.tradeData);

    const receiptData = useAppSelector((state) => state.receiptData) as receiptData;

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const lastReceipt = receiptData?.sessionReceipts[receiptData.sessionReceipts.length - 1];

    const isLastReceiptSuccess = lastReceipt?.isTxSuccess?.toString();

    let snackMessage = '';

    if (lastReceipt) {
        if (lastReceipt.receiptType === 'swap') {
            snackMessage = `You Successfully Swapped ${lastReceipt.tokenAQtyUnscaled} ${lastReceipt.tokenASymbol} for ${lastReceipt.tokenBQtyUnscaled} ${lastReceipt.tokenBSymbol}`;
        } else if (lastReceipt.receiptType === 'mint') {
            snackMessage = `You Successfully Minted a Position with ${lastReceipt.tokenAQtyUnscaled} ${lastReceipt.tokenASymbol} and ${lastReceipt.tokenBQtyUnscaled} ${lastReceipt.tokenBSymbol}`;
        } else {
            snackMessage = 'unknown';
        }
    }

    const snackbarContent = (
        <SnackbarComponent
            severity={isLastReceiptSuccess ? 'info' : 'warning'}
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {snackMessage}
        </SnackbarComponent>
    );

    useEffect(() => {
        if (lastReceipt) {
            setOpenSnackbar(true);
        }
    }, [JSON.stringify(lastReceipt)]);

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

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [isTokenABase, setIsTokenABase] = useState<boolean>(true);

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const tokenPairStringified = useMemo(() => JSON.stringify(tokenPair), [tokenPair]);

    // useEffect to set baseTokenAddress and quoteTokenAddress when pair changes
    useEffect(() => {
        // console.log({ tokenPair });
        // reset rtk values for user specified range in ticks
        dispatch(setAdvancedLowTick(0));
        dispatch(setAdvancedHighTick(0));
        if (tokenPair.dataTokenA.address && tokenPair.dataTokenB.address) {
            const sortedTokens = sortBaseQuoteTokens(
                tokenPair.dataTokenA.address,
                tokenPair.dataTokenB.address,
            );
            // console.log({ sortedTokens });
            setBaseTokenAddress(sortedTokens[0]);
            setQuoteTokenAddress(sortedTokens[1]);
            if (tokenPair.dataTokenA.address === sortedTokens[0]) {
                setIsTokenABase(true);
            } else {
                setIsTokenABase(false);
            }

            const endpoint = 'https://api.thegraph.com/subgraphs/name/a0910841082130913312/croc43';

            const queryForPositionsByPool = gql`
                query ($base: Bytes, $quote: Bytes, $poolIdx: BigInt) {
                    pools(where: { base: $base, quote: $quote, poolIdx: $poolIdx }) {
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

            const positionsByPoolVariables = {
                base: sortedTokens[0],
                quote: sortedTokens[1],
                poolIdx: 36000,
            };

            // console.log({ positionsByPoolVariables });
            request(
                endpoint,
                queryForPositionsByPool,
                positionsByPoolVariables,
                // requestHeaders: headers,
            ).then((data) => {
                // if (JSON.stringify(graphData.positionsByUser) !== JSON.stringify(data.user)) {
                const pool = data.pools[0];

                Promise.all(pool.positions.map(getPositionData)).then((updatedPositions) => {
                    pool.positions = updatedPositions;
                    // const positionArray = updatedPositions as positionsByPool
                    // console.log(pool.positions);
                    if (JSON.stringify(graphData.positionsByPool) !== JSON.stringify(pool)) {
                        dispatch(setPositionsByPool(pool));
                    }
                });
            });
        }
    }, [tokenPairStringified]);

    const [tokenABalance, setTokenABalance] = useState<string>('');
    const [tokenBBalance, setTokenBBalance] = useState<string>('');
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);

    // useEffect to get non-display spot price when tokens change and block updates
    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                const spotPrice = await getSpotPrice(
                    baseTokenAddress,
                    quoteTokenAddress,
                    POOL_PRIMARY,
                    provider,
                );
                if (poolPriceNonDisplay !== spotPrice) {
                    setPoolPriceNonDisplay(spotPrice);
                }
            })();
        }
    }, [lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    // useEffect to get display spot price when tokens change and block updates
    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                const spotPriceDisplay = await getSpotPriceDisplay(
                    baseTokenAddress,
                    quoteTokenAddress,
                    POOL_PRIMARY,
                    provider,
                );
                if (poolPriceDisplay !== spotPriceDisplay) {
                    setPoolPriceDisplay(spotPriceDisplay);
                }
            })();
        }
    }, [lastBlockNumber, baseTokenAddress, quoteTokenAddress]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account &&
                isAuthenticated &&
                isWeb3Enabled
                // && provider.connection?.url === 'metamask'
            ) {
                const signer = provider.getSigner();
                const tokenABal = await getTokenBalanceDisplay(
                    tokenPair.dataTokenA.address,
                    account,
                    signer,
                );
                // make sure a balance was returned, initialized as null
                if (tokenABal) {
                    // send value to local state
                    setTokenABalance(tokenABal);
                }
                const tokenBBal = await getTokenBalanceDisplay(
                    tokenPair.dataTokenB.address,
                    account,
                    signer,
                );
                // make sure a balance was returned, initialized as null
                if (tokenBBal) {
                    // send value to local state
                    setTokenBBalance(tokenBBal);
                }
            }
        })();
    }, [
        chainId,
        account,
        isWeb3Enabled,
        isAuthenticated,
        JSON.stringify(tokenPair),
        lastBlockNumber,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] = useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] = useState<boolean>(false);

    // useEffect to check if user has approved CrocSwap to sell the token A
    // (hardcoded for native Ether)
    useEffect(() => {
        (async () => {
            try {
                const tokenAAddress = tokenPair.dataTokenA.address;
                if (isWeb3Enabled && account !== null) {
                    if (!tokenAAddress) {
                        return;
                    }
                    if (tokenAAddress === contractAddresses.ZERO_ADDR) {
                        setTokenAAllowance((Number.MAX_SAFE_INTEGER - 1).toString());
                        return;
                    }
                    if (provider) {
                        const signer = provider.getSigner();
                        getTokenAllowance(tokenAAddress, account, signer)
                            .then(function (result) {
                                const allowance = result.lt(Number.MAX_SAFE_INTEGER - 1)
                                    ? result.toNumber()
                                    : Number.MAX_SAFE_INTEGER - 1;
                                setTokenAAllowance(allowance.toString());
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }
                }
            } catch (err) {
                console.log(err);
            }
            setRecheckTokenAApproval(false);
        })();
    }, [
        tokenPair.dataTokenA.address,
        lastBlockNumber,
        account,
        chainId,
        isWeb3Enabled,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell token B
    // (hardcoded for native Ether)
    useEffect(() => {
        (async () => {
            try {
                const tokenBAddress = tokenPair.dataTokenB.address;
                if (isWeb3Enabled && account !== null) {
                    if (!tokenBAddress) {
                        return;
                    }
                    if (tokenBAddress === contractAddresses.ZERO_ADDR) {
                        setTokenBAllowance((Number.MAX_SAFE_INTEGER - 1).toString());
                        return;
                    }
                    if (provider) {
                        const signer = provider.getSigner();
                        getTokenAllowance(tokenBAddress, account, signer)
                            .then(function (result) {
                                // console.log({ result });
                                const allowance = result.lt(Number.MAX_SAFE_INTEGER - 1)
                                    ? result.toNumber()
                                    : Number.MAX_SAFE_INTEGER - 1;
                                setTokenBAllowance(allowance.toString());
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })();
    }, [
        tokenPair.dataTokenB.address,
        account,
        chainId,
        isWeb3Enabled,
        recheckTokenBApproval,
        lastBlockNumber,
    ]);

    const graphData = useAppSelector((state) => state.graphData);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getPositionData = async (position: any): Promise<any> => {
        const baseTokenAddress = position.pool.base;
        const quoteTokenAddress = position.pool.quote;
        const poolPriceNonDisplay = await getSpotPrice(
            baseTokenAddress,
            quoteTokenAddress,
            POOL_PRIMARY,
            provider,
        );

        position.accountId = position.id.substring(0, 42);
        const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

        position.poolPriceInTicks = poolPriceInTicks;
        if (baseTokenAddress === contractAddresses.ZERO_ADDR) {
            position.baseTokenSymbol = 'ETH';
            position.quoteTokenSymbol = 'DAI';
            position.tokenAQtyDisplay = '1';
            position.tokenBQtyDisplay = '2000';
            if (!position.ambient) {
                position.lowRangeDisplay = '.001';
                position.highRangeDisplay = '.002';
            }
        } else if (
            baseTokenAddress.toLowerCase() ===
            '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'.toLowerCase()
        ) {
            position.baseTokenSymbol = 'DAI';
            position.quoteTokenSymbol = 'USDC';
            position.tokenAQtyDisplay = '101';
            position.tokenBQtyDisplay = '100';
            if (!position.ambient) {
                position.lowRangeDisplay = '0.9';
                position.highRangeDisplay = '1.1';
            }
        } else {
            position.baseTokenSymbol = 'unknownBase';
            position.quoteTokenSymbol = 'unknownQuote';
        }
        return position;
    };

    useEffect(() => {
        if (isAuthenticated && account) {
            const endpoint = 'https://api.thegraph.com/subgraphs/name/a0910841082130913312/croc22';
            const queryForPositionsByUser = gql`
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
            const positionByUserVariables = {
                userAddress: account,
            };
            request(
                endpoint,
                queryForPositionsByUser,
                positionByUserVariables,
                // requestHeaders: headers,
            ).then((data) => {
                // if (JSON.stringify(graphData.positionsByUser) !== JSON.stringify(data.user)) {
                const userData = data.user;
                const allPositions = userData.positions;

                // let updatedAllPositionsArray = [];

                Promise.all(allPositions.map(getPositionData)).then((updatedPositions) => {
                    userData.positions = updatedPositions;
                    if (JSON.stringify(graphData.positionsByUser) !== JSON.stringify(userData)) {
                        dispatch(setPositionsByUser(userData));
                    }
                });
            });
        }
    }, [isAuthenticated, account, lastBlockNumber]);

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
        setTokenABalance('0');
        setTokenBBalance('0');
        dispatch(resetTradeData());
        dispatch(resetGraphData());
        dispatch(resetReceiptData());

        await logout();
    };

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account &&
                isAuthenticated &&
                isWeb3Enabled
                // && provider.connection?.url === 'metamask'
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

    const shouldDisplayAccountTab = isAuthenticated && account != '';

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
        clickLogout: clickLogout,
        metamaskLocked: metamaskLocked,
        ensName: ensName,
        shouldDisplayAccountTab: shouldDisplayAccountTab,
    };

    // props for <Swap/> React element
    const swapProps = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        // tokenBAllowance: tokenBAllowance,
        chainId: chainId ?? '0x2a'
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        // tokenBAllowance: tokenBAllowance,
        chainId: chainId ?? '0x2a'
    };

    // props for <Limit/> React element on trade route
    const limitPropsTrade = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        isTokenABase: isTokenABase,
        poolPriceDisplay: poolPriceDisplay,
        poolPriceNonDisplay: poolPriceNonDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainId ?? '0x2a'
    };

    // props for <Range/> React element
    const rangeProps = {
        importedTokens: importedTokens,
        provider: provider as JsonRpcProvider,
        lastBlockNumber: lastBlockNumber,
        gasPriceinGwei: gasPriceinGwei,
        baseTokenAddress: baseTokenAddress,
        quoteTokenAddress: quoteTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        poolPriceDisplay: poolPriceDisplay.toString(),
        tokenABalance: tokenABalance,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenBBalance: tokenBBalance,
        tokenBAllowance: tokenBAllowance,
        setRecheckTokenBApproval: setRecheckTokenBApproval,
        chainId: chainId ?? '0x2a'
    };

    // props for <Sidebar/> React element
    function toggleSidebar() {
        setShowSidebar(!showSidebar);
    }
    const sidebarProps = {
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
    };

    function updateDenomIsInBase() {
        // console.log('------------');
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true
        const isDenomInBase =
            poolPriceDisplay < 1
                ? tradeData.didUserFlipDenom
                    ? false
                    : true
                : tradeData.didUserFlipDenom
                ? true
                : false;
        return isDenomInBase;
    }

    useEffect(() => {
        const isDenomBase = updateDenomIsInBase();
        if (tradeData.isDenomBase !== isDenomBase) {
            dispatch(setDenomInBase(isDenomBase));
        }
    }, [tradeData.didUserFlipDenom, tokenPair]);

    const mainLayoutStyle = showSidebar ? 'main-layout-2' : 'main-layout';
    // take away margin from left if we are on homepage or swap
    const noSidebarStyle =
        currentLocation == '/' || currentLocation == '/swap' || currentLocation == '/404'
            ? 'no-sidebar'
            : mainLayoutStyle;
    const swapBodyStyle = currentLocation == '/swap' ? 'swap-body' : null;

    return (
        <>
            <div className='content-container'>
                {currentLocation !== '/404' && <PageHeader {...headerProps} />}
                {currentLocation !== '/' &&
                    currentLocation !== '/swap' &&
                    currentLocation !== '/404' && <Sidebar {...sidebarProps} />}
                <div className={`${noSidebarStyle} ${swapBodyStyle}`}>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route
                            path='trade'
                            element={
                                <Trade account={account ?? ''} isAuthenticated={isAuthenticated} />
                            }
                        >
                            <Route path='' element={<Swap {...swapPropsTrade} />} />
                            <Route path='market' element={<Swap {...swapPropsTrade} />} />
                            <Route path='limit' element={<Limit {...limitPropsTrade} />} />
                            <Route path='range' element={<Range {...rangeProps} />} />
                            <Route path='edit/:positionHash' element={<Edit />} />
                        </Route>
                        <Route path='analytics' element={<Analytics />} />
                        <Route path='details' element={<PositionDetails />} />
                        <Route path='range2' element={<Range {...rangeProps} />} />

                        <Route
                            path='account'
                            element={
                                <Portfolio
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                />
                            }
                        />

                        <Route path='swap' element={<Swap {...swapProps} />} />
                        <Route path='chart' element={<Chart />} />
                        <Route path='testpage' element={<TestPage />} />
                        <Route path='*' element={<Navigate to='/404' replace />} />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </div>
                {snackbarContent}
            </div>
            <PageFooter lastBlockNumber={lastBlockNumber} />
        </>
    );
}
