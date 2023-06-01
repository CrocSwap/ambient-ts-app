// START: Import React and Dongles
import { useEffect, useState, useContext, memo } from 'react';
import { useEnsName } from 'wagmi';
import { BigNumber, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';

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
import { fetchAddress } from '../../App/functions/fetchAddress';
import { useModal } from '../../components/Global/Modal/useModal';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    setErc20Tokens,
    setNativeToken,
    setResolvedAddressRedux,
} from '../../utils/state/userDataSlice';
import useMediaQuery from '../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { diffHashSig } from '../../utils/functions/diffHashSig';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { AppStateContext } from '../../contexts/AppStateContext';
import { TokenContext } from '../../contexts/TokenContext';
import { IS_LOCAL_ENV } from '../../constants';
import {
    memoizeFetchNativeTokenBalance,
    memoizeFetchErc20TokenBalances,
} from '../../App/functions/fetchTokenBalances';

interface propsIF {
    userAccount?: boolean;
}

function Portfolio(props: propsIF) {
    const { userAccount } = props;

    const { addressCurrent: userAddress, isLoggedIn: isUserConnected } =
        useAppSelector((state) => state.userData);
    const { data: ensName } = useEnsName({ address: userAddress });

    const {
        wagmiModal: { open: openModalWallet },
    } = useContext(AppStateContext);
    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { tokens, setInput } = useContext(TokenContext);

    const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();
    const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();

    const dispatch = useAppDispatch();

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
        const oldToken: TokenIF | undefined = tokens.getTokenByAddress(
            token.address,
        );
        const newToken = { ...token };
        newToken.name = oldToken ? oldToken.name : '';
        newToken.logoURI = oldToken ? oldToken.logoURI : '';
        return newToken;
    };

    const [mainnetProvider, setMainnetProvider] = useState<
        Provider | undefined
    >();
    useEffect(() => {
        const infuraKey2 = process.env.REACT_APP_INFURA_KEY_2
            ? process.env.REACT_APP_INFURA_KEY_2
            : '360ea5fda45b4a22883de8522ebd639e'; // croc labs #2

        const mainnetProvider = new ethers.providers.JsonRpcProvider(
            'https://mainnet.infura.io/v3/' + infuraKey2, // croc labs #2
        );
        IS_LOCAL_ENV && console.debug({ mainnetProvider });
        setMainnetProvider(mainnetProvider);
    }, []);

    useEffect(() => {
        if (crocEnv && selectedToken.address && userAddress) {
            crocEnv
                .token(selectedToken.address)
                .wallet(userAddress)
                .then((bal: BigNumber) => setTokenWalletBalance(bal.toString()))
                .catch(console.error);
            crocEnv
                .token(selectedToken.address)
                .balance(userAddress)
                .then((bal: BigNumber) => {
                    setTokenDexBalance(bal.toString());
                })
                .catch(console.error);
        }

        if (recheckTokenBalances) {
            (async () => {
                if (userAddress) {
                    const newNativeToken: TokenIF =
                        await cachedFetchNativeTokenBalance(
                            userAddress,
                            chainId,
                            lastBlockNumber,
                            crocEnv,
                        );

                    dispatch(setNativeToken(newNativeToken));

                    const erc20Results: TokenIF[] =
                        await cachedFetchErc20TokenBalances(
                            userAddress,
                            chainId,
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
        userAddress,
        lastBlockNumber,
        recheckTokenBalances,
    ]);

    useEffect(() => {
        (async () => {
            if (crocEnv && userAddress && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(userAddress);
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
        userAddress,
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
        resolvedAddress.toLowerCase() === userAddress?.toLowerCase();

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

    const [secondaryEnsName, setSecondaryEnsName] = useState('');
    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (addressFromParams && !isAddressEns && mainnetProvider) {
                try {
                    const ensName = await fetchAddress(
                        mainnetProvider,
                        addressFromParams,
                        chainId,
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
                mainnetProvider={mainnetProvider}
                selectedToken={selectedToken}
                tokenAllowance={tokenAllowance}
                tokenWalletBalance={tokenWalletBalance}
                tokenDexBalance={tokenDexBalance}
                setRecheckTokenAllowance={setRecheckTokenAllowance}
                setRecheckTokenBalances={setRecheckTokenBalances}
                openTokenModal={openTokenModal}
                fullLayoutActive={fullLayoutActive}
                setFullLayoutActive={setFullLayoutActive}
                selectedTokenDecimals={selectedTokenDecimals}
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
                chainId &&
                lastBlockNumber &&
                !connectedAccountActive
            ) {
                try {
                    const newNativeToken = await cachedFetchNativeTokenBalance(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    if (
                        diffHashSig(resolvedAddressNativeToken) !==
                        diffHashSig(newNativeToken)
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
                        chainId,
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
                            diffHashSig(
                                resolvedAddressErc20Tokens[
                                    indexOfExistingToken
                                ],
                            ) !== diffHashSig(newToken)
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
        chainId,
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

    const showLoggedInButton = userAccount && !isUserConnected;
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
        resolvedAddressTokens: resolvedAddressTokens,
        resolvedAddress: resolvedAddress,
        connectedAccountActive: connectedAccountActive,
        openTokenModal: openTokenModal,
        fullLayoutToggle: fullLayerToggle,
        tokens: tokens,
    };

    const portfolioBannerProps = {
        ensName: connectedAccountActive
            ? ensName ?? ''
            : secondaryEnsName
            ? secondaryEnsName
            : '',
        resolvedAddress: resolvedAddress,
        setShowProfileSettings: setShowProfileSettings,
        connectedAccountActive: connectedAccountActive,
    };

    const profileSettingsProps = {
        showProfileSettings: showProfileSettings,
        setShowProfileSettings: setShowProfileSettings,
        ensName: secondaryEnsName ? secondaryEnsName : ensName ?? '',
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
                        closeModal={closeTokenModal}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={
                            setShowSoloSelectTokenButtons
                        }
                        isSingleToken={true}
                        tokenAorB={null}
                    />
                </Modal>
            )}
        </main>
    );
}

export default memo(Portfolio);
