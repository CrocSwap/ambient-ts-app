// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { CrocEnv, ChainSpec } from '@crocswap-libs/sdk';
import sum from 'hash-sum';

// START: Import JSX Components
import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import Modal from '../../components/Global/Modal/Modal';
import NotFound from '../NotFound/NotFound';
import Button from '../../components/Global/Button/Button';
import ProfileSettings from '../../components/Portfolio/ProfileSettings/ProfileSettings';
import { SoloTokenSelect } from '../../components/Global/TokenSelectContainer/SoloTokenSelect';

// START: Import Other Local Files
import styles from './Portfolio.module.css';
import { TokenIF } from '../../utils/interfaces/exports';
import { useParams } from 'react-router-dom';
import { getNFTs } from '../../App/functions/getNFTs';
import { fetchAddress } from '../../App/functions/fetchAddress';
import { useModal } from '../../components/Global/Modal/useModal';
import {
    Erc20TokenBalanceFn,
    nativeTokenBalanceFn,
} from '../../App/functions/fetchTokenBalances';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../App/functions/fetchTokenPrice';
import {
    setErc20Tokens,
    setNativeToken,
    setResolvedAddressRedux,
} from '../../utils/state/userDataSlice';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { allDexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import { allSlippageMethodsIF } from '../../App/hooks/useSlippage';
import { ackTokensMethodsIF } from '../../App/hooks/useAckTokens';
import { PositionUpdateFn } from '../../App/functions/getPositionData';

interface propsIF {
    crocEnv: CrocEnv | undefined;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: {
        onCurrentChain?: boolean;
        count?: number | null;
    }) => TokenIF[];
    getAmbientTokens: () => TokenIF[];
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (
        searchName: string,
        chn: string,
        exact: boolean,
    ) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    isTokenABase: boolean;
    provider: ethers.providers.Provider | undefined;
    cachedFetchNativeTokenBalance: nativeTokenBalanceFn;
    cachedFetchErc20TokenBalances: Erc20TokenBalanceFn;
    cachedPositionUpdateQuery: PositionUpdateFn;
    cachedFetchTokenPrice: TokenPriceFn;
    ensName: string;
    lastBlockNumber: number;
    connectedAccount: string;
    userImageData: string[];
    chainId: string;
    tokensOnActiveLists: Map<string, TokenIF>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    userAccount?: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    openModalWallet: () => void;
    searchableTokens: TokenIF[];
    chainData: ChainSpec;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    account: string;
    isSidebarOpen: boolean;
    isUserLoggedIn: boolean | undefined;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    handlePulseAnimation: (type: string) => void;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    cachedQuerySpotPrice: SpotPriceFn;
    mainnetProvider: Provider | undefined;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
    slippage: allSlippageMethodsIF;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
    ackTokens: ackTokensMethodsIF;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
}

export default function Portfolio(props: propsIF) {
    const {
        searchableTokens,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        crocEnv,
        addRecentToken,
        getRecentTokens,
        getTokensByName,
        getTokenByAddress,
        verifyToken,
        isTokenABase,
        provider,
        cachedFetchNativeTokenBalance,
        cachedFetchErc20TokenBalances,
        cachedFetchTokenPrice,
        lastBlockNumber,
        userImageData,
        tokensOnActiveLists,
        openGlobalModal,
        closeGlobalModal,
        userAccount,
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
        setSelectedOutsideTab,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        isSidebarOpen,
        handlePulseAnimation,
        openModalWallet,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        chainData,
        mainnetProvider,
        setSimpleRangeWidth,
        dexBalancePrefs,
        slippage,
        gasPriceInGwei,
        ethMainnetUsdPrice,
        ackTokens,
        setExpandTradeTable,
    } = props;

    const { isConnected, address } = useAccount();
    const { data: ensName } = useEnsName({ address });

    const dispatch = useAppDispatch();

    const connectedAccount = address;

    const isUserLoggedIn = isConnected;

    const selectedToken: TokenIF = useAppSelector(
        (state) => state.soloTokenData.token,
    );

    const [tokenAllowance, setTokenAllowance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] =
        useState<boolean>(false);
    const [recheckTokenBalances, setRecheckTokenBalances] =
        useState<boolean>(false);

    const [tokenWalletBalance, setTokenWalletBalance] = useState<string>('');
    const [tokenDexBalance, setTokenDexBalance] = useState<string>('');

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;

    const addTokenInfo = (token: TokenIF): TokenIF => {
        const newToken = { ...token };
        const tokenAddress = token.address;
        const key =
            tokenAddress.toLowerCase() + '_0x' + token.chainId.toString(16);
        const tokenName = tokensOnActiveLists.get(key)?.name;
        const tokenLogoURI = tokensOnActiveLists.get(key)?.logoURI;
        newToken.name = tokenName ?? '';
        newToken.logoURI = tokenLogoURI ?? '';
        return newToken;
    };

    useEffect(() => {
        if (crocEnv && selectedToken.address && connectedAccount) {
            crocEnv
                .token(selectedToken.address)
                .wallet(connectedAccount)
                .then((bal: BigNumber) => setTokenWalletBalance(bal.toString()))
                .catch(console.error);
            crocEnv
                .token(selectedToken.address)
                .balance(connectedAccount)
                .then((bal: BigNumber) => {
                    setTokenDexBalance(bal.toString());
                })
                .catch(console.error);
        }

        if (recheckTokenBalances) {
            (async () => {
                if (connectedAccount) {
                    const newNativeToken: TokenIF =
                        await cachedFetchNativeTokenBalance(
                            connectedAccount,
                            chainData.chainId,
                            lastBlockNumber,
                            crocEnv,
                        );

                    dispatch(setNativeToken(newNativeToken));

                    const erc20Results: TokenIF[] =
                        await cachedFetchErc20TokenBalances(
                            connectedAccount,
                            chainData.chainId,
                            lastBlockNumber,
                            crocEnv,
                        );
                    const erc20TokensWithLogos = erc20Results.map((token) =>
                        addTokenInfo(token),
                    );

                    dispatch(setErc20Tokens(erc20TokensWithLogos));
                }
            })();
        }

        setRecheckTokenBalances(false);
    }, [
        crocEnv,
        selectedToken.address,
        connectedAccount,
        lastBlockNumber,
        recheckTokenBalances,
    ]);

    useEffect(() => {
        (async () => {
            if (crocEnv && connectedAccount && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(connectedAccount);
                    setTokenAllowance(allowance.toString());
                } catch (err) {
                    console.warn(err);
                }
                setRecheckTokenAllowance(false);
            }
        })();
    }, [
        crocEnv,
        selectedTokenAddress,
        lastBlockNumber,
        connectedAccount,
        recheckTokenAllowance,
    ]);

    const { address: addressFromParams } = useParams();

    const isAddressEns = addressFromParams?.endsWith('.eth');
    const isAddressHex =
        addressFromParams?.startsWith('0x') && addressFromParams?.length == 42;

    if (addressFromParams && !isAddressEns && !isAddressHex)
        return <NotFound />;

    const [resolvedAddress, setResolvedAddress] = useState<string>('');

    const connectedAccountActive =
        !addressFromParams ||
        resolvedAddress.toLowerCase() === connectedAccount?.toLowerCase();

    useEffect(() => {
        (async () => {
            if (addressFromParams && isAddressEns && mainnetProvider) {
                try {
                    const newResolvedAddress =
                        await mainnetProvider.resolveName(addressFromParams);
                    if (newResolvedAddress) {
                        setResolvedAddress(newResolvedAddress);
                        dispatch(setResolvedAddressRedux(newResolvedAddress));
                    }
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

    const [secondaryImageData, setSecondaryImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (resolvedAddress && !connectedAccountActive) {
                const imageLocalURLs = await getNFTs(resolvedAddress);
                if (imageLocalURLs) {
                    setSecondaryImageData(imageLocalURLs);
                }
            }
        })();
    }, [resolvedAddress, connectedAccountActive]);

    const [secondaryEnsName, setSecondaryEnsName] = useState('');
    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (addressFromParams && !isAddressEns && mainnetProvider) {
                try {
                    const ensName = await fetchAddress(
                        mainnetProvider,
                        addressFromParams,
                        chainData.chainId,
                    );

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
    }, [addressFromParams, isAddressEns, mainnetProvider]);

    const modalCloseCustom = (): void => setInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] =
        useModal(modalCloseCustom);

    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const exchangeBalanceComponent = (
        <div className={styles.exchange_balance}>
            <ExchangeBalance
                crocEnv={crocEnv}
                mainnetProvider={mainnetProvider}
                ethMainnetUsdPrice={ethMainnetUsdPrice}
                connectedAccount={connectedAccount || ''}
                setSelectedOutsideTab={setSelectedOutsideTab}
                setOutsideControl={setOutsideControl}
                openGlobalModal={openGlobalModal}
                closeGlobalModal={closeGlobalModal}
                selectedToken={selectedToken}
                tokenAllowance={tokenAllowance}
                tokenWalletBalance={tokenWalletBalance}
                tokenDexBalance={tokenDexBalance}
                setRecheckTokenAllowance={setRecheckTokenAllowance}
                setRecheckTokenBalances={setRecheckTokenBalances}
                lastBlockNumber={lastBlockNumber}
                openTokenModal={openTokenModal}
                fullLayoutActive={fullLayoutActive}
                setFullLayoutActive={setFullLayoutActive}
                selectedTokenDecimals={selectedTokenDecimals}
                gasPriceInGwei={gasPriceInGwei}
            />
        </div>
    );

    useEffect(() => {
        !connectedAccountActive
            ? setFullLayoutActive(true)
            : setFullLayoutActive(false);
    }, [connectedAccountActive]);

    const fullLayerToggle = (
        <div
            className={styles.right_tab_option}
            onClick={() => setFullLayoutActive(!fullLayoutActive)}
        >
            <section>
                {' '}
                <div
                    className={`${styles.full_layout_svg} ${
                        fullLayoutActive && styles.active_layout_style
                    } `}
                />
            </section>
            <section className={styles.shared_layout_svg}>
                <div
                    className={`${styles.full_layout_svg_copied} ${
                        !fullLayoutActive && styles.active_layout_style
                    }`}
                />
                <div
                    className={`${styles.half_layout_svg} ${
                        !fullLayoutActive && styles.active_layout_style
                    }`}
                />
            </section>
        </div>
    );

    const connectedUserNativeToken = useAppSelector(
        (state) => state.userData.tokens.nativeToken,
    );
    const connectedUserErc20Tokens = useAppSelector(
        (state) => state.userData.tokens.erc20Tokens,
    );

    const connectedUserTokens = [connectedUserNativeToken].concat(
        connectedUserErc20Tokens,
    );

    const [resolvedAddressNativeToken, setResolvedAddressNativeToken] =
        useState<TokenIF | undefined>();
    const [resolvedAddressErc20Tokens, setResolvedAddressErc20Tokens] =
        useState<TokenIF[]>([]);

    const resolvedAddressTokens = [resolvedAddressNativeToken].concat(
        resolvedAddressErc20Tokens,
    );

    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                resolvedAddress &&
                chainData.chainId &&
                lastBlockNumber &&
                !connectedAccountActive
            ) {
                try {
                    const newNativeToken = await cachedFetchNativeTokenBalance(
                        resolvedAddress,
                        chainData.chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    if (
                        sum(resolvedAddressNativeToken) !== sum(newNativeToken)
                    ) {
                        setResolvedAddressNativeToken(newNativeToken);
                    }
                } catch (error) {
                    console.error({ error });
                }
                try {
                    const updatedTokens: TokenIF[] = resolvedAddressErc20Tokens;

                    const erc20Results = await cachedFetchErc20TokenBalances(
                        resolvedAddress,
                        chainData.chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    erc20Results.map((newToken: TokenIF) => {
                        const indexOfExistingToken =
                            resolvedAddressErc20Tokens.findIndex(
                                (existingToken) =>
                                    existingToken.address === newToken.address,
                            );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        } else if (
                            sum(
                                resolvedAddressErc20Tokens[
                                    indexOfExistingToken
                                ],
                            ) !== sum(newToken)
                        ) {
                            updatedTokens[indexOfExistingToken] = newToken;
                        }
                    });
                    setResolvedAddressErc20Tokens(updatedTokens);
                } catch (error) {
                    console.error({ error });
                }
            }
        })();
    }, [
        crocEnv,
        resolvedAddress,
        chainData.chainId,
        lastBlockNumber,
        connectedAccountActive,
    ]);

    const [showProfileSettings, setShowProfileSettings] = useState(false);

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const handleInputClear = () => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    const showLoggedInButton = userAccount && !isUserLoggedIn;
    const [showTabsAndNotExchange, setShowTabsAndNotExchange] = useState(false);
    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const mobileDataToggle = (
        <div className={styles.mobile_toggle_container}>
            <button
                onClick={() =>
                    setShowTabsAndNotExchange(!showTabsAndNotExchange)
                }
                className={
                    showTabsAndNotExchange
                        ? styles.non_active_button_mobile_toggle
                        : styles.active_button_mobile_toggle
                }
            >
                Transactions
            </button>
            <button
                onClick={() =>
                    setShowTabsAndNotExchange(!showTabsAndNotExchange)
                }
                className={
                    showTabsAndNotExchange
                        ? styles.active_button_mobile_toggle
                        : styles.non_active_button_mobile_toggle
                }
            >
                Exchange
            </button>
        </div>
    );

    const notConnectedContent = (
        <div className={styles.non_connected_content}>
            <p>Please connect your wallet.</p>
            <Button
                flat
                title='Connect Wallet'
                action={() => openModalWallet()}
            />
        </div>
    );

    const portfolioTabsProps = {
        tokenList: searchableTokens,
        searchableTokens: searchableTokens,
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        cachedPositionUpdateQuery: cachedPositionUpdateQuery,
        crocEnv: crocEnv,
        isTokenABase: isTokenABase,
        provider: provider,
        cachedFetchTokenPrice: cachedFetchTokenPrice,
        connectedUserTokens: connectedUserTokens,
        resolvedAddressTokens: resolvedAddressTokens,
        resolvedAddress: resolvedAddress,
        lastBlockNumber: lastBlockNumber,
        activeAccount: address ?? connectedAccount ?? '',
        connectedAccountActive: connectedAccountActive,
        chainId: chainData.chainId,
        tokenMap: tokensOnActiveLists,
        selectedOutsideTab: selectedOutsideTab,
        setSelectedOutsideTab: setSelectedOutsideTab,
        setOutsideControl: setOutsideControl,
        outsideControl: outsideControl,
        openTokenModal: openTokenModal,
        openGlobalModal: openGlobalModal,
        closeGlobalModal: closeGlobalModal,
        isSidebarOpen: isSidebarOpen,
        account: props.account,
        chainData: chainData,
        currentPositionActive: props.currentPositionActive,
        setCurrentPositionActive: props.setCurrentPositionActive,
        isUserLoggedIn: isUserLoggedIn,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        fullLayoutToggle: fullLayerToggle,
        handlePulseAnimation: handlePulseAnimation,
        setSimpleRangeWidth: setSimpleRangeWidth,
        dexBalancePrefs: dexBalancePrefs,
        slippage: slippage,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        setExpandTradeTable: setExpandTradeTable,
    };

    const portfolioBannerProps = {
        ensName: connectedAccountActive
            ? ensName ?? ''
            : secondaryEnsName
            ? secondaryEnsName
            : '',
        resolvedAddress: resolvedAddress,
        activeAccount: address ?? connectedAccount ?? '',
        imageData: connectedAccountActive ? userImageData : secondaryImageData,
        setShowProfileSettings: setShowProfileSettings,
        connectedAccountActive: connectedAccountActive,
        chainData: chainData,
    };

    const profileSettingsProps = {
        showProfileSettings: showProfileSettings,
        setShowProfileSettings: setShowProfileSettings,
        ensName: secondaryEnsName ? secondaryEnsName : ensName ?? '',
        imageData: connectedAccountActive ? userImageData : secondaryImageData,
        openGlobalModal: openGlobalModal,
    };

    const mobilePortfolio = (
        <section
            style={{
                height: 'calc(100vh - 8rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                margin: '0 auto',
                paddingLeft: '8px',
            }}
        >
            {connectedAccountActive && mobileDataToggle}
            {!showTabsAndNotExchange ? (
                showLoggedInButton ? (
                    notConnectedContent
                ) : (
                    <PortfolioTabs {...portfolioTabsProps} />
                )
            ) : showLoggedInButton ? (
                notConnectedContent
            ) : (
                connectedAccountActive && exchangeBalanceComponent
            )}
        </section>
    );

    if (showActiveMobileComponent) return mobilePortfolio;

    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            {userAccount && showProfileSettings && (
                <ProfileSettings {...profileSettingsProps} />
            )}
            <PortfolioBanner {...portfolioBannerProps} />

            <div
                className={
                    fullLayoutActive
                        ? styles.full_layout_container
                        : styles.tabs_exchange_balance_container
                }
            >
                {!showLoggedInButton ? (
                    <PortfolioTabs {...portfolioTabsProps} />
                ) : (
                    notConnectedContent
                )}

                {showLoggedInButton
                    ? notConnectedContent
                    : connectedAccountActive && exchangeBalanceComponent}
            </div>
            {isTokenModalOpen && (
                <Modal
                    onClose={closeTokenModal}
                    title='Select Token'
                    centeredTitle
                    handleBack={handleInputClear}
                    showBackButton={!showSoloSelectTokenButtons}
                    footer={null}
                >
                    <SoloTokenSelect
                        modalCloseCustom={modalCloseCustom}
                        provider={provider}
                        closeModal={closeTokenModal}
                        chainId={chainData.chainId}
                        importedTokensPlus={outputTokens}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        verifyToken={verifyToken}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={
                            setShowSoloSelectTokenButtons
                        }
                        outputTokens={outputTokens}
                        validatedInput={validatedInput}
                        setInput={setInput}
                        searchType={searchType}
                        addRecentToken={addRecentToken}
                        getRecentTokens={getRecentTokens}
                        isSingleToken={true}
                        tokenAorB={null}
                        ackTokens={ackTokens}
                    />
                </Modal>
            )}
        </main>
    );
}
