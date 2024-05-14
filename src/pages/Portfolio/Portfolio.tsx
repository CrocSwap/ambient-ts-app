// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useMemo } from 'react';

// START: Import JSX Components
import ExchangeBalance from '../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import Button from '../../components/Form/Button';
import ProfileSettings from '../../components/Portfolio/ProfileSettings/ProfileSettings';

// START: Import Other Local Files
import { TokenIF } from '../../ambient-utils/types';
import {
    fetchBlastUserXpData,
    fetchEnsAddress,
    fetchUserXpData,
} from '../../ambient-utils/api';
import { Navigate, useParams } from 'react-router-dom';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { trimString } from '../../ambient-utils/dataLayer';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { TokenContext } from '../../contexts/TokenContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { useSimulatedIsUserConnected } from '../../App/hooks/useSimulatedIsUserConnected';
import {
    MobileButton,
    PortfolioContainer,
    PortfolioTabsContainer,
} from '../../styled/Components/Portfolio';
import { FlexContainer, Text } from '../../styled/Common';
import {
    BlastUserXpDataIF,
    UserDataContext,
    UserXpDataIF,
} from '../../contexts/UserDataContext';
import Level from '../Level/Level';
import { TradeTableContext } from '../../contexts/TradeTableContext';

interface PortfolioPropsIF {
    isLevelsPage?: boolean;
    isRanksPage?: boolean;
    isViewMoreActive?: boolean;
    isPointsTab?: boolean;
}

function Portfolio(props: PortfolioPropsIF) {
    const {
        userAddress,
        setResolvedAddressInContext,
        ensName,
        setSecondaryEnsInContext,
    } = useContext(UserDataContext);
    const { isLevelsPage, isRanksPage, isViewMoreActive, isPointsTab } = props;

    const isUserConnected = useSimulatedIsUserConnected();

    const {
        walletModal: { open: openModalWallet },
    } = useContext(AppStateContext);
    const { cachedFetchTokenBalances, cachedTokenDetails } =
        useContext(CachedDataContext);
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
                    const updatedTokens: TokenIF[] = [];

                    const tokenBalanceResults = await cachedFetchTokenBalances(
                        resolvedAddress,
                        chainId,
                        everyFiveMinutes,
                        cachedTokenDetails,
                        crocEnv,
                        activeNetwork.graphCacheUrl,
                        tokens.tokenUniv,
                    );

                    const tokensWithLogos = tokenBalanceResults.map((token) => {
                        const oldToken: TokenIF | undefined =
                            tokens.getTokenByAddress(token.address);
                        const newToken = { ...token };
                        newToken.name = oldToken ? oldToken.name : '';
                        newToken.logoURI = oldToken ? oldToken.logoURI : '';
                        return newToken;
                    });

                    tokensWithLogos.map((newToken: TokenIF) => {
                        const indexOfExistingToken = updatedTokens.findIndex(
                            (existingToken) =>
                                existingToken.address === newToken.address,
                        );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        }
                    });
                    setResolvedAddressTokens(updatedTokens);
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
    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const mobileDataToggle = (
        <FlexContainer
            justifyContent='center'
            alignItems='center'
            background='dark2'
            rounded
            outline='text2'
            margin='10px auto'
        >
            <MobileButton
                onClick={() =>
                    setShowTabsAndNotExchange(!showTabsAndNotExchange)
                }
                active={!showTabsAndNotExchange}
            >
                Transactions
            </MobileButton>
            <MobileButton
                onClick={() =>
                    setShowTabsAndNotExchange(!showTabsAndNotExchange)
                }
                active={showTabsAndNotExchange}
            >
                Exchange
            </MobileButton>
        </FlexContainer>
    );

    const notConnectedContent = (
        <FlexContainer
            fullWidth
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
                addressFromParams !== undefined:
                return <PortfolioTabs {...portfolioTabsProps} />;
            case showTabsAndNotExchange &&
                isUserConnected &&
                connectedAccountActive:
                return exchangeBalanceComponent;
            default:
                return notConnectedContent;
        }
    })();

    // tab control on account from pageheader
    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute
        ? 0
        : onAccountRoute || addressFromParams
        ? 3
        : 0;

    useEffect(() => {
        if (isPointsTab) {
            setOutsideControl(true);
            setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        }
    }, [isPointsTab]);

    // end of tab control on account from page header

    const mobilePortfolio = (
        <FlexContainer
            flexDirection='column'
            gap={4}
            margin='0 auto'
            height='calc(100vh - 8rem)'
            style={{
                padding: ' 0 8px',
            }}
        >
            <PortfolioBanner {...portfolioBannerProps} />

            {connectedAccountActive && mobileDataToggle}
            {contentToRenderOnMobile}
        </FlexContainer>
    );
    if (showActiveMobileComponent && !isLevelsPage) return mobilePortfolio;
    if (isLevelsPage) return <Level {...levelsProps} />;

    return (
        <PortfolioContainer
            data-testid={'portfolio'}
            padding='32px'
            background='dark2'
            flexDirection='column'
            gap={16}
        >
            {connectedAccountActive && showProfileSettings && (
                <ProfileSettings {...profileSettingsProps} />
            )}
            <PortfolioBanner {...portfolioBannerProps} />

            <PortfolioTabsContainer
                active={connectedAccountActive}
                fullLayoutContainer={
                    !connectedAccountActive || fullLayoutActive
                }
            >
                {isUserConnected || addressFromParams ? (
                    <PortfolioTabs {...portfolioTabsProps} />
                ) : undefined}

                {connectedAccountActive
                    ? exchangeBalanceComponent
                    : !isUserConnected && !addressFromParams
                    ? notConnectedContent
                    : undefined}
            </PortfolioTabsContainer>
        </PortfolioContainer>
    );
}

export default memo(Portfolio);
