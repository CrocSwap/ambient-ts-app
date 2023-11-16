// START: Import React and Dongles
import { useEffect, useState, useContext, memo, useMemo } from 'react';
import { useEnsName } from 'wagmi';

// START: Import JSX Components
import ExchangeBalance from '../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import Button from '../../components/Form/Button';
import ProfileSettings from '../../components/Portfolio/ProfileSettings/ProfileSettings';

// START: Import Other Local Files
import { TokenIF } from '../../utils/interfaces/exports';
import { fetchEnsAddress } from '../../App/functions/fetchAddress';
import { Navigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { setResolvedAddressRedux } from '../../utils/state/userDataSlice';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { diffHashSig } from '../../utils/functions/diffHashSig';
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

function Portfolio() {
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const { data: ensName } = useEnsName({ address: userAddress });

    const isUserConnected = useSimulatedIsUserConnected();

    const {
        wagmiModal: { open: openModalWallet },
    } = useContext(AppStateContext);
    const { cachedFetchTokenBalances, cachedTokenDetails } =
        useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { client } = useContext(ChainDataContext);
    const { tokens } = useContext(TokenContext);

    const dispatch = useAppDispatch();

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

    const connectedAccountActive = useMemo(
        () =>
            userAddress
                ? addressFromParams
                    ? resolvedAddress?.toLowerCase() ===
                      userAddress.toLowerCase()
                        ? true
                        : false
                    : true
                : false,
        [addressFromParams, resolvedAddress, userAddress],
    );

    useEffect(() => {
        (async () => {
            if (addressFromParams && isAddressEns && mainnetProvider) {
                try {
                    const newResolvedAddress =
                        await mainnetProvider.resolveName(addressFromParams);
                    setResolvedAddress(newResolvedAddress ?? '');
                    dispatch(setResolvedAddressRedux(newResolvedAddress ?? ''));
                } catch (error) {
                    console.error({ error });
                }
            } else if (addressFromParams && isAddressHex && !isAddressEns) {
                setResolvedAddress(addressFromParams);
                dispatch(setResolvedAddressRedux(addressFromParams));
            } else {
                setResolvedAddress('');
                dispatch(setResolvedAddressRedux(''));
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

                    if (ensName) setSecondaryEnsName(ensName);
                    else setSecondaryEnsName('');
                } catch (error) {
                    setSecondaryEnsName('');
                    console.error({ error });
                }
            } else if (addressFromParams && isAddressEns) {
                setSecondaryEnsName(addressFromParams);
            }
        })();
    }, [addressFromParams, isAddressEns]);

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
                client &&
                resolvedAddress &&
                chainId &&
                !connectedAccountActive
            ) {
                try {
                    const updatedTokens: TokenIF[] = resolvedAddressTokens;

                    const tokenBalanceResults = await cachedFetchTokenBalances(
                        resolvedAddress,
                        chainId,
                        everyFiveMinutes,
                        cachedTokenDetails,
                        crocEnv,
                        activeNetwork.graphCacheUrl,
                        client,
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
                        const indexOfExistingToken =
                            resolvedAddressTokens.findIndex(
                                (existingToken) =>
                                    existingToken.address === newToken.address,
                            );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        } else if (
                            diffHashSig(
                                resolvedAddressTokens[indexOfExistingToken],
                            ) !== diffHashSig(newToken)
                        ) {
                            updatedTokens[indexOfExistingToken] = newToken;
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
        client !== undefined,
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

    const mobilePortfolio = (
        <FlexContainer
            flexDirection='column'
            gap={4}
            margin='0 auto'
            height='calc(100vh - 8rem)'
            style={{
                paddingLeft: '8px',
            }}
        >
            {connectedAccountActive && mobileDataToggle}
            {contentToRenderOnMobile}
        </FlexContainer>
    );

    if (showActiveMobileComponent) return mobilePortfolio;

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
