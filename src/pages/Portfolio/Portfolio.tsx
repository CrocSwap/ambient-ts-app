import ExchangeBalance from '../../components/Portfolio/EchangeBalance/ExchangeBalance';
import PortfolioBanner from '../../components/Portfolio/PortfolioBanner/PortfolioBanner';
import PortfolioTabs from '../../components/Portfolio/PortfolioTabs/PortfolioTabs';
import styles from './Portfolio.module.css';
import { useParams } from 'react-router-dom';
import { getNFTs } from '../../App/functions/getNFTs';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { fetchAddress } from '../../App/functions/fetchAddress';
import { BigNumber, ethers } from 'ethers';
import { CrocEnv, ChainSpec } from '@crocswap-libs/sdk';
import Modal from '../../components/Global/Modal/Modal';
import { useModal } from '../../components/Global/Modal/useModal';
import { TokenIF } from '../../utils/interfaces/exports';
import Button from '../../components/Global/Button/Button';
import { Erc20TokenBalanceFn, nativeTokenBalanceFn } from '../../App/functions/fetchTokenBalances';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import { TokenPriceFn } from '../../App/functions/fetchTokenPrice';
import NotFound from '../NotFound/NotFound';
import ProfileSettings from '../../components/Portfolio/ProfileSettings/ProfileSettings';
import { SoloTokenSelect } from '../../components/Global/TokenSelectContainer/SoloTokenSelect';
// import { useSoloSearch } from '../../components/Global/TokenSelectContainer/hooks/useSoloSearch';
import {
    setErc20Tokens,
    setNativeToken,
    setResolvedAddressRedux,
    setSecondaryImageDataRedux,
} from '../../utils/state/userDataSlice';
import { useAccount, useEnsName } from 'wagmi';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';

const infuraKey2 = process.env.REACT_APP_INFURA_KEY_2;

const mainnetProvider = infuraKey2
    ? new ethers.providers.WebSocketProvider(
          'wss://mainnet.infura.io/ws/v3/' + infuraKey2, // croc labs #2
      )
    : new ethers.providers.WebSocketProvider(
          'wss://mainnet.infura.io/ws/v3/360ea5fda45b4a22883de8522ebd639e', // croc labs #2
      );

interface propsIF {
    crocEnv: CrocEnv | undefined;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: { onCurrentChain?: boolean; count?: number | null }) => TokenIF[];
    getAmbientTokens: () => TokenIF[];
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    isTokenABase: boolean;
    provider: ethers.providers.Provider | undefined;
    cachedFetchNativeTokenBalance: nativeTokenBalanceFn;
    cachedFetchErc20TokenBalances: Erc20TokenBalanceFn;
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
    importedTokens: TokenIF[];
    chainData: ChainSpec;
    searchableTokens: TokenIF[];
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    account: string;
    showSidebar: boolean;
    isUserLoggedIn: boolean | undefined;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    handlePulseAnimation: (type: string) => void;

    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    gasPriceInGwei: number | undefined;
    acknowledgeToken: (tkn: TokenIF) => void;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    cachedQuerySpotPrice: SpotPriceFn;
}

export default function Portfolio(props: propsIF) {
    const {
        searchableTokens,
        cachedQuerySpotPrice,
        crocEnv,
        addRecentToken,
        getRecentTokens,
        // getAmbientTokens,
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
        // connectedAccount,
        // chainId,
        tokensOnActiveLists,
        openGlobalModal,
        closeGlobalModal,
        userAccount,
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
        setSelectedOutsideTab,
        importedTokens,
        setImportedTokens,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        showSidebar,
        handlePulseAnimation,
        gasPriceInGwei,
        openModalWallet,
        acknowledgeToken,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
    } = props;

    const { isConnected, address } = useAccount();
    const { data: ensName } = useEnsName({ address });

    const chainId = '0x5';

    const dispatch = useAppDispatch();

    const connectedAccount = address;

    const isUserLoggedIn = isConnected;

    const selectedToken: TokenIF = useAppSelector((state) => state.temp.token);

    const [tokenAllowance, setTokenAllowance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] = useState<boolean>(false);
    const [recheckTokenBalances, setRecheckTokenBalances] = useState<boolean>(false);

    const [tokenWalletBalance, setTokenWalletBalance] = useState<string>('');
    const [tokenDexBalance, setTokenDexBalance] = useState<string>('');

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;

    const addTokenInfo = (token: TokenIF): TokenIF => {
        const newToken = { ...token };
        const tokenAddress = token.address;
        const key = tokenAddress.toLowerCase() + '_0x' + token.chainId.toString(16);

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
                .catch(console.log);
            crocEnv
                .token(selectedToken.address)
                .balance(connectedAccount)
                .then((bal: BigNumber) => {
                    setTokenDexBalance(bal.toString());
                })
                .catch(console.log);
        }

        if (recheckTokenBalances) {
            (async () => {
                if (connectedAccount) {
                    const newNativeToken: TokenIF = await cachedFetchNativeTokenBalance(
                        connectedAccount,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    dispatch(setNativeToken(newNativeToken));

                    const erc20Results: TokenIF[] = await cachedFetchErc20TokenBalances(
                        connectedAccount,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );
                    const erc20TokensWithLogos = erc20Results.map((token) => addTokenInfo(token));

                    dispatch(setErc20Tokens(erc20TokensWithLogos));
                }
            })();
        }

        setRecheckTokenBalances(false);
    }, [crocEnv, selectedToken.address, connectedAccount, lastBlockNumber, recheckTokenBalances]);

    useEffect(() => {
        (async () => {
            if (crocEnv && connectedAccount && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(connectedAccount);
                    setTokenAllowance(allowance.toString());
                    // setTokenAllowance(toDisplayQty(allowance, selectedTokenDecimals));
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenAllowance(false);
            }
        })();
    }, [crocEnv, selectedTokenAddress, lastBlockNumber, connectedAccount, recheckTokenAllowance]);

    const { address: addressFromParams } = useParams();

    const isAddressEns = addressFromParams?.endsWith('.eth');
    const isAddressHex = addressFromParams?.startsWith('0x') && addressFromParams?.length == 42;

    if (addressFromParams && !isAddressEns && !isAddressHex) return <NotFound />;
    // if (address && !isAddressEns && !isAddressHex) return <Navigate replace to='/404' />;

    const [resolvedAddress, setResolvedAddress] = useState<string>('');

    const connectedAccountActive =
        !addressFromParams || resolvedAddress.toLowerCase() === connectedAccount?.toLowerCase();

    useEffect(() => {
        (async () => {
            if (addressFromParams && isAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(addressFromParams);
                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                    dispatch(setResolvedAddressRedux(newResolvedAddress));
                }
            } else if (addressFromParams && isAddressHex && !isAddressEns) {
                setResolvedAddress(addressFromParams);
                dispatch(setResolvedAddressRedux(addressFromParams));
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
                    dispatch(setSecondaryImageDataRedux(imageLocalURLs));
                }
            }
        })();
    }, [resolvedAddress, connectedAccountActive]);

    const [secondaryEnsName, setSecondaryEnsName] = useState('');
    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (addressFromParams && !isAddressEns) {
                try {
                    const ensName = await fetchAddress(mainnetProvider, addressFromParams, chainId);

                    if (ensName) setSecondaryEnsName(ensName);
                    else setSecondaryEnsName('');
                } catch (error) {
                    setSecondaryEnsName('');
                    console.log({ error });
                }
            } else if (addressFromParams && isAddressEns) {
                setSecondaryEnsName(addressFromParams);
            }
        })();
    }, [addressFromParams, isAddressEns]);

    const modalCloseCustom = (): void => setInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] = useModal(modalCloseCustom);

    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const exchangeBalanceComponent = (
        <div className={styles.exchange_balance}>
            <ExchangeBalance
                crocEnv={crocEnv}
                mainnetProvider={mainnetProvider}
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
        !connectedAccountActive ? setFullLayoutActive(true) : setFullLayoutActive(false);
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

            <section
                // onClick={() => setFullLayoutActive(!fullLayoutActive)}
                className={styles.shared_layout_svg}
            >
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

    const connectedUserNativeToken = useAppSelector((state) => state.userData.tokens.nativeToken);
    const connectedUserErc20Tokens = useAppSelector((state) => state.userData.tokens.erc20Tokens);

    // // TODO: move this function up to App.tsx
    // const getImportedTokensPlus = () => {
    //     // array of all tokens on Ambient list from useToken() hook
    //     const ambientTokens = getAmbientTokens();
    //     // array of addresses on Ambient list
    //     const ambientAddresses = ambientTokens.map((tkn) => tkn.address.toLowerCase());
    //     // use Ambient token list as scaffold to build larger token array
    //     const output = ambientTokens;
    //     // limiter for tokens to add from connected wallet
    //     let tokensAdded = 0;
    //     // iterate over tokens in connected wallet
    //     console.log({connectedUserErc20Tokens});
    //     connectedUserErc20Tokens?.forEach((tkn) => {
    //         // gatekeep to make sure token is not already in the array,
    //         // ... that the token can be verified against a known list,
    //         // ... that user has a positive balance of the token, and
    //         // ... that the limiter has not been reached
    //         if (
    //             !ambientAddresses.includes(tkn.address.toLowerCase()) &&
    //             verifyToken(tkn.address, chainId) &&
    //             parseInt(tkn.combinedBalance as string) > 0 &&
    //             tokensAdded < 4
    //         ) {
    //             tokensAdded++;
    //             output.push({ ...tkn, fromList: 'wallet' });
    //             // increment the limiter by one
    //             tokensAdded++;
    //             // add the token to the output array
    //             output.push({ ...tkn, fromList: 'wallet' });
    //         }
    //     });
    //     // limiter for tokens to add from in-session recent tokens list
    //     let recentTokensAdded = 0;
    //     // iterate over tokens in recent tokens list
    //     getRecentTokens().forEach((tkn) => {
    //         // gatekeep to make sure the token isn't already in the list,
    //         // ... is on the current chain, and that the limiter has not
    //         // ... yet been reached
    //         if (
    //             !output.some(
    //                 (tk) =>
    //                     tk.address.toLowerCase() === tkn.address.toLowerCase() &&
    //                     tk.chainId === tkn.chainId,
    //             ) &&
    //             tkn.chainId === parseInt(chainId) &&
    //             recentTokensAdded < 2
    //         ) {
    //             // increment the limiter by one
    //             recentTokensAdded++;
    //             // add the token to the output array
    //             output.push(tkn);
    //         }
    //     });
    //     // return compiled array of tokens
    //     console.log({output});
    //     return output;
    // };

    const connectedUserTokens = [connectedUserNativeToken].concat(connectedUserErc20Tokens);

    const [resolvedAddressNativeToken, setResolvedAddressNativeToken] = useState<
        TokenIF | undefined
    >();
    const [resolvedAddressErc20Tokens, setResolvedAddressErc20Tokens] = useState<TokenIF[]>([]);

    const resolvedAddressTokens = [resolvedAddressNativeToken].concat(resolvedAddressErc20Tokens);

    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                resolvedAddress &&
                chainId &&
                lastBlockNumber &&
                !connectedAccountActive
            ) {
                try {
                    // console.log('fetching native token balance');
                    const newNativeToken = await cachedFetchNativeTokenBalance(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    if (
                        JSON.stringify(resolvedAddressNativeToken) !==
                        JSON.stringify(newNativeToken)
                    ) {
                        setResolvedAddressNativeToken(newNativeToken);
                    }
                } catch (error) {
                    console.log({ error });
                }
                try {
                    const updatedTokens: TokenIF[] = resolvedAddressErc20Tokens;

                    const erc20Results = await cachedFetchErc20TokenBalances(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    erc20Results.map((newToken: TokenIF) => {
                        const indexOfExistingToken = resolvedAddressErc20Tokens.findIndex(
                            (existingToken) => existingToken.address === newToken.address,
                        );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        } else if (
                            JSON.stringify(resolvedAddressErc20Tokens[indexOfExistingToken]) !==
                            JSON.stringify(newToken)
                        ) {
                            updatedTokens[indexOfExistingToken] = newToken;
                        }
                    });
                    setResolvedAddressErc20Tokens(updatedTokens);
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [crocEnv, resolvedAddress, chainId, lastBlockNumber, connectedAccountActive]);

    const [showProfileSettings, setShowProfileSettings] = useState(false);

    // const defaultTokens = getImportedTokensPlus();

    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] = useState(true);
    // hook to process search input and return an array of relevant tokens
    // also returns state setter function and values for control flow
    // const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
    //     chainId,
    //     importedTokens,
    //     verifyToken,
    //     getTokenByAddress,
    //     getTokensByName,
    //     defaultTokens
    // );

    const handleInputClear = () => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    const showLoggedInButton = userAccount && !isUserLoggedIn;

    // console.log({ secondaryEnsName });
    // console.log({ ensName });
    const [showTabsAndNotExchange, setShowTabsAndNotExchange] = useState(false);
    const hideTabs = useMediaQuery('(max-width: 1200px)') && showTabsAndNotExchange;
    const hideExchange = useMediaQuery('(max-width: 1200px)') && !showTabsAndNotExchange;

    const mobileDataToggle = (
        <div className={styles.mobile_toggle_container}>
            <button
                onClick={() => setShowTabsAndNotExchange(!showTabsAndNotExchange)}
                className={
                    showTabsAndNotExchange
                        ? styles.non_active_button_mobile_toggle
                        : styles.active_button_mobile_toggle
                }
            >
                Transactions
            </button>
            <button
                onClick={() => setShowTabsAndNotExchange(!showTabsAndNotExchange)}
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

    return (
        <main data-testid={'portfolio'} className={styles.portfolio_container}>
            {userAccount && showProfileSettings && (
                <ProfileSettings
                    showProfileSettings={showProfileSettings}
                    setShowProfileSettings={setShowProfileSettings}
                    ensName={secondaryEnsName ? secondaryEnsName : ensName ?? ''}
                    imageData={connectedAccountActive ? userImageData : secondaryImageData}
                    openGlobalModal={openGlobalModal}
                />
            )}
            <PortfolioBanner
                ensName={
                    connectedAccountActive
                        ? ensName ?? ''
                        : secondaryEnsName
                        ? secondaryEnsName
                        : ''
                }
                resolvedAddress={resolvedAddress}
                activeAccount={address ?? connectedAccount ?? ''}
                imageData={connectedAccountActive ? userImageData : secondaryImageData}
                setShowProfileSettings={setShowProfileSettings}
                connectedAccountActive={connectedAccountActive}
            />

            {mobileDataToggle}
            <div
                className={
                    fullLayoutActive
                        ? styles.full_layout_container
                        : styles.tabs_exchange_balance_container
                }
            >
                {!showLoggedInButton && !hideTabs ? (
                    <PortfolioTabs
                        searchableTokens={searchableTokens}
                        cachedQuerySpotPrice={cachedQuerySpotPrice}
                        crocEnv={crocEnv}
                        isTokenABase={isTokenABase}
                        provider={provider}
                        cachedFetchTokenPrice={cachedFetchTokenPrice}
                        importedTokens={importedTokens}
                        connectedUserTokens={connectedUserTokens}
                        resolvedAddressTokens={resolvedAddressTokens}
                        resolvedAddress={resolvedAddress}
                        lastBlockNumber={lastBlockNumber}
                        activeAccount={address ?? connectedAccount ?? ''}
                        connectedAccountActive={connectedAccountActive}
                        chainId={chainId}
                        tokenMap={tokensOnActiveLists}
                        selectedOutsideTab={selectedOutsideTab}
                        setSelectedOutsideTab={setSelectedOutsideTab}
                        setOutsideControl={setOutsideControl}
                        outsideControl={outsideControl}
                        openTokenModal={openTokenModal}
                        openGlobalModal={openGlobalModal}
                        closeGlobalModal={closeGlobalModal}
                        showSidebar={showSidebar}
                        account={props.account}
                        chainData={props.chainData}
                        currentPositionActive={props.currentPositionActive}
                        setCurrentPositionActive={props.setCurrentPositionActive}
                        isUserLoggedIn={isUserLoggedIn}
                        baseTokenBalance={baseTokenBalance}
                        quoteTokenBalance={quoteTokenBalance}
                        baseTokenDexBalance={baseTokenDexBalance}
                        quoteTokenDexBalance={quoteTokenDexBalance}
                        currentTxActiveInTransactions={currentTxActiveInTransactions}
                        setCurrentTxActiveInTransactions={setCurrentTxActiveInTransactions}
                        fullLayoutToggle={fullLayerToggle}
                        handlePulseAnimation={handlePulseAnimation}
                    />
                ) : (
                    !hideTabs && (
                        <div className={styles.non_connected_content}>
                            <p>Please connect wallet to view your transactions.</p>
                            <Button flat title='Connect Wallet' action={() => openModalWallet()} />
                        </div>
                    )
                )}
                {connectedAccountActive && !hideExchange && exchangeBalanceComponent}
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
                        chainId={chainId}
                        importedTokens={outputTokens}
                        setImportedTokens={setImportedTokens}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        verifyToken={verifyToken}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
                        outputTokens={outputTokens}
                        validatedInput={validatedInput}
                        setInput={setInput}
                        searchType={searchType}
                        addRecentToken={addRecentToken}
                        getRecentTokens={getRecentTokens}
                        isSingleToken={true}
                        tokenAorB={null}
                        acknowledgeToken={acknowledgeToken}
                    />
                </Modal>
            )}
        </main>
    );
}
