// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useMemo } from 'react';

// START: Import JSX Components
import ExchangeBalance from '../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import Button from '../../../components/Form/Button';
import ProfileSettings from '../../../components/Portfolio/ProfileSettings/ProfileSettings';

// START: Import Other Local Files
import { TokenIF } from '../../../ambient-utils/types';
import {
    expandTokenBalances,
    fetchBlastUserXpData,
    fetchEnsAddress,
    fetchUserXpData,
    IDexTokenBalances,
} from '../../../ambient-utils/api';
import { Navigate, useParams } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { trimString } from '../../../ambient-utils/dataLayer';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { useSimulatedIsUserConnected } from '../../../App/hooks/useSimulatedIsUserConnected';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    BlastUserXpDataIF,
    UserDataContext,
    UserXpDataIF,
} from '../../../contexts/UserDataContext';
import Level from '../Level/Level';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import styles from './Portfolio.module.css';

interface PortfolioPropsIF {
    isLevelsPage?: boolean;
    isRanksPage?: boolean;
    isViewMoreActive?: boolean;
    specificTab?: string;
}

function Portfolio(props: PortfolioPropsIF) {
    const {
        userAddress,
        setResolvedAddressInContext,
        ensName,
        setSecondaryEnsInContext,
    } = useContext(UserDataContext);
    const { isLevelsPage, isRanksPage, isViewMoreActive, specificTab } = props;

    const isUserConnected = useSimulatedIsUserConnected();

    const {
        walletModal: { open: openModalWallet },
    } = useContext(AppStateContext);
    const {
        cachedFetchAmbientListWalletBalances,
        cachedFetchDexBalances,
        cachedTokenDetails,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { isActiveNetworkBlast } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);
    const { setOutsideControl, setSelectedOutsideTab } =
        useContext(TradeTableContext);

    const { mainnetProvider } = useContext(CrocEnvContext);

    const { address: addressFromParams } = useParams();

    const isAddressEns = addressFromParams?.endsWith('.eth');
    const isAddressHex =
        addressFromParams?.startsWith('0x') && addressFromParams?.length == 42;

    if (addressFromParams && !isAddressEns && !isAddressHex)
        return <Navigate to='/404' replace />;

    const [resolvedAddress, setResolvedAddress] = useState<string | undefined>(
        undefined,
    );

    const connectedAccountActive: boolean = useMemo(
        () =>
            userAddress
                ? addressFromParams
                    ? resolvedAddress
                        ? resolvedAddress?.toLowerCase() ===
                          userAddress.toLowerCase()
                            ? true
                            : false
                        : true
                    : true
                : false,
        [addressFromParams, resolvedAddress, userAddress],
    );

    useEffect(() => {
        (async () => {
            if (addressFromParams && isAddressEns && mainnetProvider) {
                try {
                    // @emily
                    const newResolvedAddress =
                        await mainnetProvider.resolveName(addressFromParams);
                    setResolvedAddress(newResolvedAddress ?? '');
                    setResolvedAddressInContext(newResolvedAddress ?? '');
                } catch (error) {
                    console.error({ error });
                }
            } else if (addressFromParams && isAddressHex && !isAddressEns) {
                setResolvedAddress(addressFromParams);
                setResolvedAddressInContext(addressFromParams);
            } else {
                setResolvedAddress('');
                setResolvedAddressInContext('');
            }
        })();
    }, [addressFromParams, isAddressHex, isAddressEns, mainnetProvider]);

    const [secondaryEnsName, setSecondaryEnsName] = useState('');
    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (addressFromParams && !isAddressEns) {
                try {
                    const ensName = await fetchEnsAddress(addressFromParams);

                    if (ensName) {
                        setSecondaryEnsName(ensName);
                        setSecondaryEnsInContext(ensName);
                    } else {
                        setSecondaryEnsName('');
                        setSecondaryEnsInContext('');
                    }
                } catch (error) {
                    setSecondaryEnsName('');
                    setSecondaryEnsInContext('');
                    console.error({ error });
                }
            } else if (addressFromParams && isAddressEns) {
                setSecondaryEnsName(addressFromParams);
                setSecondaryEnsInContext(addressFromParams);
            }
        })();
    }, [addressFromParams, isAddressEns]);

    const [resolvedUserXp, setResolvedUserXp] = useState<UserXpDataIF>({
        dataReceived: false,
        data: undefined,
    });

    const [resolvedUserBlastXp, setResolvedUserBlastXp] =
        useState<BlastUserXpDataIF>({
            dataReceived: false,
            data: undefined,
        });

    // fetch xp data for resolved address if not connected user account
    useEffect(() => {
        if (!connectedAccountActive && resolvedAddress) {
            fetchUserXpData({ user: resolvedAddress, chainId: chainId })
                .then((resolvedUserXp) => {
                    setResolvedUserXp({
                        dataReceived: true,
                        data: resolvedUserXp,
                    });
                })
                .catch((error) => {
                    console.error({ error });
                    setResolvedUserXp({
                        dataReceived: false,
                        data: undefined,
                    });
                });
            if (isActiveNetworkBlast) {
                fetchBlastUserXpData({
                    user: resolvedAddress,
                    chainId: chainId,
                })
                    .then((resolvedUserBlastXp) => {
                        setResolvedUserBlastXp({
                            dataReceived: true,
                            data: resolvedUserBlastXp,
                        });
                    })
                    .catch((error) => {
                        console.error({ error });
                        setResolvedUserBlastXp({
                            dataReceived: false,
                            data: undefined,
                        });
                    });
            }
        }
    }, [connectedAccountActive, resolvedAddress, isActiveNetworkBlast]);

    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const exchangeBalanceComponent = (
        <ExchangeBalance
            fullLayoutActive={fullLayoutActive}
            setFullLayoutActive={setFullLayoutActive}
        />
    );

    useEffect(() => {
        !connectedAccountActive
            ? setFullLayoutActive(true)
            : setFullLayoutActive(false);
    }, [connectedAccountActive]);

    const [resolvedAddressTokens, setResolvedAddressTokens] = useState<
        TokenIF[]
    >([]);

    // used to trigger token balance refreshes every 5 minutes
    const everyFiveMinutes = Math.floor(Date.now() / 300000);

    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                resolvedAddress &&
                chainId &&
                !connectedAccountActive
            ) {
                try {
                    setResolvedAddressTokens([]);
                    const combinedBalances: TokenIF[] = [];

                    // fetch wallet balances for tokens in ambient token list
                    const AmbientListWalletBalances: TokenIF[] | undefined =
                        await cachedFetchAmbientListWalletBalances({
                            address: resolvedAddress,
                            chain: chainId,
                            crocEnv: crocEnv,
                            _refreshTime: everyFiveMinutes,
                        });

                    combinedBalances.push(...AmbientListWalletBalances);

                    // fetch exchange balances and wallet balances for tokens in user's exchange balances
                    const dexBalancesFromCache = await cachedFetchDexBalances({
                        address: resolvedAddress,
                        chain: chainId,
                        crocEnv: crocEnv,
                        graphCacheUrl: activeNetwork.graphCacheUrl,
                        _refreshTime: everyFiveMinutes,
                    });

                    if (dexBalancesFromCache !== undefined) {
                        await Promise.all(
                            dexBalancesFromCache.map(
                                async (tokenBalances: IDexTokenBalances) => {
                                    const indexOfExistingToken = (
                                        combinedBalances ?? []
                                    ).findIndex(
                                        (existingToken) =>
                                            existingToken.address.toLowerCase() ===
                                            tokenBalances.tokenAddress.toLowerCase(),
                                    );
                                    const newToken = await expandTokenBalances(
                                        tokenBalances,
                                        tokens.tokenUniv,
                                        cachedTokenDetails,
                                        crocEnv,
                                        chainId,
                                    );

                                    if (indexOfExistingToken === -1) {
                                        const updatedToken = {
                                            ...newToken,
                                        };
                                        combinedBalances.push(updatedToken);
                                    } else {
                                        const existingToken =
                                            combinedBalances[
                                                indexOfExistingToken
                                            ];

                                        const updatedToken = {
                                            ...existingToken,
                                        };

                                        updatedToken.dexBalance =
                                            newToken.dexBalance;

                                        combinedBalances[indexOfExistingToken] =
                                            updatedToken;
                                    }
                                },
                            ),
                        );
                    }

                    const tokensWithLogos = combinedBalances.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };
                        newToken.name = oldToken ? oldToken.name : '';
                        newToken.logoURI = oldToken ? oldToken.logoURI : '';
                        newToken.symbol =
                            oldToken?.symbol || newToken.symbol || '';
                        return newToken;
                    });

                    setResolvedAddressTokens(tokensWithLogos);
                } catch (error) {
                    console.error({ error });
                }
            }
        })();
    }, [
        crocEnv,
        resolvedAddress,
        chainId,
        everyFiveMinutes,
        connectedAccountActive,
        activeNetwork.graphCacheUrl,
    ]);

    const [showProfileSettings, setShowProfileSettings] = useState(false);

    const [showTabsAndNotExchange, setShowTabsAndNotExchange] = useState(false);
    const showActiveMobileComponent = useMediaQuery('(max-width: 768px)');



    const notConnectedContent = (
        <FlexContainer
            fullWidth
            fullHeight
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            gap={8}
        >
            <Text>Please connect your wallet.</Text>
            <Button
                idForDOM='connect_wallet_in_account_page'
                flat
                title='Connect Wallet'
                action={() => openModalWallet()}
            />
        </FlexContainer>
    );

    const portfolioTabsProps = {
        resolvedAddressTokens: resolvedAddressTokens,
        resolvedAddress: resolvedAddress,
        connectedAccountActive: connectedAccountActive,
        fullLayoutActive: fullLayoutActive,
        resolvedUserXp: resolvedUserXp,
        resolvedUserBlastXp: resolvedUserBlastXp,
    };

    const portfolioBannerProps = {
        ensName: connectedAccountActive
            ? ensName ?? ''
            : secondaryEnsName
              ? secondaryEnsName
              : '',
        resolvedAddress: resolvedAddress ?? '',
        setShowProfileSettings: setShowProfileSettings,
        connectedAccountActive: connectedAccountActive,
        resolvedUserXp: resolvedUserXp,
        showTabsAndNotExchange: showTabsAndNotExchange,
        setShowTabsAndNotExchange: setShowTabsAndNotExchange
    };

    const truncatedAccountAddressOrEnsName = connectedAccountActive
        ? ensName
            ? ensName
            : trimString(userAddress ?? '', 6, 6, '…')
        : secondaryEnsName
          ? secondaryEnsName
          : trimString(resolvedAddress ?? '', 6, 6, '…');

    const levelsProps = {
        resolvedAddress: resolvedAddress ?? '',
        truncatedAccountAddressOrEnsName: truncatedAccountAddressOrEnsName,
        connectedAccountActive: connectedAccountActive,
        isDisplayRank: isRanksPage,
        resolvedUserXp,
        isViewMoreActive,
    };

    const profileSettingsProps = {
        showProfileSettings: showProfileSettings,
        setShowProfileSettings: setShowProfileSettings,
        ensName: secondaryEnsName ? secondaryEnsName : ensName ?? '',
    };

    

    const contentToRenderOnMobile = (() => {
        switch (true) {
            case (!showTabsAndNotExchange && isUserConnected) ||
                (addressFromParams !== undefined && !connectedAccountActive):
                return <PortfolioTabs {...portfolioTabsProps} />;

            case showTabsAndNotExchange &&
                isUserConnected &&
                connectedAccountActive:
                return exchangeBalanceComponent;
            default:
                return notConnectedContent;
        }
    })();

    const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

    useEffect(() => {
        const calculateHeight = () => {
          const totalHeight = window.innerHeight;
          const heightToSubtract = 56 + 56; // Subtract 56px from top and 56px from bottom
          setAvailableHeight(totalHeight - heightToSubtract);
        };
    
        calculateHeight(); // Calculate initial height
        window.addEventListener('resize', calculateHeight);
    
        return () => window.removeEventListener('resize', calculateHeight);
    }, []);
    
    const bannerHeight = 115;
    const contentHeight = availableHeight - bannerHeight;



    const mobilePortfolio = (
        <div className={styles.mobile_layout} style={{ height: `${availableHeight}px` }}>
        
            <PortfolioBanner {...portfolioBannerProps} />
            <div style={{ height: `${contentHeight}px`, overflowY: 'hidden' }}>

                {contentToRenderOnMobile}
            </div>
        </div>
    );

    // tab control on account from pageheader
    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute
        ? 0
        : onAccountRoute || addressFromParams
          ? specificTab === 'points'
              ? 3
              : specificTab === 'liquidity'
                ? 2
                : specificTab === 'limits'
                  ? 1
                  : specificTab === 'transactions'
                    ? 0
                    : specificTab === 'exchange-balances'
                      ? 4
                      : specificTab === 'wallet-balances'
                        ? 5
                        : 0
          : 0;

    useEffect(() => {
        if (specificTab) {
            setOutsideControl(true);
            setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        }
    }, [specificTab]);

    // end of tab control on account from page header
    // const mobilePortfolio = (
    //     <div className={styles.mobile_container}>
    //         {useMediaQuery('(min-height: 300px)') && (
    //             <PortfolioBanner {...portfolioBannerProps} />
    //         )}
    //         <div className={styles.mobile_content}>
    //             {
    //                 connectedAccountActive &&
    //                 mobileDataToggle}
    //             {contentToRenderOnMobile}
    //         </div>
    //     </div>
    // );

    // const yes = false

 

    if (showActiveMobileComponent && !isLevelsPage) return mobilePortfolio;
    if (isLevelsPage) return <Level {...levelsProps} />;

    return (
        <div data-testid={'portfolio'} className={styles.portfolio_container}>
            {connectedAccountActive && showProfileSettings && (
                <ProfileSettings {...profileSettingsProps} />
            )}

            <div
                className={`${styles.portfolio_tabs_container}
                 ${connectedAccountActive ? styles.active : ''} ${
                     !connectedAccountActive || fullLayoutActive
                         ? styles.fullLayoutContainer
                         : ''
                 }`}
            >
                {isUserConnected || addressFromParams ? (
                    <PortfolioTabs {...portfolioTabsProps} />
                ) : undefined}

                {connectedAccountActive
                    ? exchangeBalanceComponent
                    : !isUserConnected && !addressFromParams
                      ? notConnectedContent
                      : undefined}
            </div>
            <PortfolioBanner {...portfolioBannerProps} />
        </div>
    );
}

export default memo(Portfolio);