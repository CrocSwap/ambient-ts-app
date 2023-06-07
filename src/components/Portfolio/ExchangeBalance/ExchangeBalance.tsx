import styles from './ExchangeBalance.module.css';

import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';
import { motion } from 'framer-motion';
import {
    SetStateAction,
    Dispatch,
    useState,
    useEffect,
    useContext,
} from 'react';
import { TokenIF } from '../../../utils/interfaces/exports';
import { BigNumber } from 'ethers';
import { fetchEnsAddress } from '../../../App/functions/fetchAddress';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import {
    setErc20Tokens,
    setNativeToken,
} from '../../../utils/state/userDataSlice';
import { useDispatch } from 'react-redux';
import { TokenContext } from '../../../contexts/TokenContext';
import { getMainnetProvider } from '../../../App/functions/getMainnetProvider';
import { useModal } from '../../Global/Modal/useModal';
import { SoloTokenSelect } from '../../../components/Global/TokenSelectContainer/SoloTokenSelect';
import { AppStateContext } from '../../../contexts/AppStateContext';

interface propsIF {
    fullLayoutActive: boolean;
    setFullLayoutActive: Dispatch<SetStateAction<boolean>>;
    isModalView?: boolean;
}

export default function ExchangeBalance(props: propsIF) {
    const {
        fullLayoutActive,
        setFullLayoutActive,
        isModalView = false,
    } = props;
    const closeModalCustom = () => setInput('');

    const [mainnetProvider] = useState(getMainnetProvider());
    const [isTokenModalOpen, openTokenModal, closeTokenModal] =
        useModal(closeModalCustom);

    const selectedToken: TokenIF = useAppSelector(
        (state) => state.soloTokenData.token,
    );
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const dispatch = useDispatch();

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { cachedFetchErc20TokenBalances, cachedFetchNativeTokenBalance } =
        useContext(CachedDataContext);
    const { addTokenInfo, setInput } = useContext(TokenContext);
    const {
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
    } = useContext(AppStateContext);

    const [tokenAllowance, setTokenAllowance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] =
        useState<boolean>(false);
    const [recheckTokenBalances, setRecheckTokenBalances] =
        useState<boolean>(false);

    const [tokenWalletBalance, setTokenWalletBalance] = useState<string>('');
    const [tokenDexBalance, setTokenDexBalance] = useState<string>('');

    const [sendToAddress, setSendToAddress] = useState<string | undefined>();
    const [resolvedAddress, setResolvedAddress] = useState<
        string | undefined
    >();
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] =
        useState(true);

    const isSendToAddressEns = sendToAddress?.endsWith('.eth');
    const isSendToAddressHex =
        sendToAddress?.startsWith('0x') && sendToAddress?.length == 42;

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;

    useEffect(() => {
        if (isTokenModalOpen) {
            openGlobalModal(
                <SoloTokenSelect
                    modalCloseCustom={closeModalCustom}
                    closeModal={closeTokenModal}
                    showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                    setShowSoloSelectTokenButtons={
                        setShowSoloSelectTokenButtons
                    }
                    isSingleToken={true}
                    tokenAorB={null}
                />,
                'Select Token',
            );
        } else {
            closeGlobalModal();
        }
    }, [isTokenModalOpen]);

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

    useEffect(() => {
        (async () => {
            if (sendToAddress && isSendToAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(
                    sendToAddress,
                );

                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                } else {
                    setResolvedAddress(undefined);
                }
            } else if (
                sendToAddress &&
                isSendToAddressHex &&
                !isSendToAddressEns
            ) {
                setResolvedAddress(sendToAddress);
            } else {
                setResolvedAddress(undefined);
            }
        })();
    }, [
        sendToAddress,
        isSendToAddressHex,
        isSendToAddressEns,
        mainnetProvider,
    ]);

    const [secondaryEnsName, setSecondaryEnsName] = useState<
        string | undefined
    >();

    // check for ENS name
    useEffect(() => {
        (async () => {
            if (
                sendToAddress &&
                isSendToAddressHex &&
                sendToAddress.length === 42 &&
                sendToAddress.startsWith('0x') &&
                mainnetProvider
            ) {
                try {
                    const ensName = await fetchEnsAddress(
                        mainnetProvider,
                        sendToAddress,
                        '0x1',
                    );
                    if (ensName) {
                        setSecondaryEnsName(ensName);
                    } else setSecondaryEnsName(undefined);
                } catch (error) {
                    setSecondaryEnsName(undefined);
                    console.error({ error });
                }
            } else {
                setSecondaryEnsName(undefined);
            }
        })();
    }, [sendToAddress, isSendToAddressHex]);

    const accountData = [
        {
            label: 'Deposit',
            content: (
                <Deposit
                    selectedToken={selectedToken}
                    tokenAllowance={tokenAllowance}
                    tokenWalletBalance={tokenWalletBalance}
                    setRecheckTokenAllowance={setRecheckTokenAllowance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    openTokenModal={openTokenModal}
                    selectedTokenDecimals={selectedTokenDecimals}
                />
            ),
            icon: depositImage,
        },
        {
            label: 'Withdraw',
            content: (
                <Withdraw
                    selectedToken={selectedToken}
                    tokenDexBalance={tokenDexBalance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    sendToAddress={sendToAddress}
                    resolvedAddress={resolvedAddress}
                    setSendToAddress={setSendToAddress}
                    secondaryEnsName={secondaryEnsName}
                    openTokenModal={openTokenModal}
                />
            ),
            icon: withdrawImage,
        },
        {
            label: 'Transfer',
            content: (
                <Transfer
                    selectedToken={selectedToken}
                    tokenDexBalance={tokenDexBalance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    sendToAddress={sendToAddress}
                    resolvedAddress={resolvedAddress}
                    setSendToAddress={setSendToAddress}
                    secondaryEnsName={secondaryEnsName}
                    openTokenModal={openTokenModal}
                />
            ),
            icon: transferImage,
        },
    ];

    const exchangeControl = (
        <section
            className={styles.control_container}
            onClick={() => setFullLayoutActive(!fullLayoutActive)}
        >
            <IconWithTooltip title='Exchange Balance' placement='bottom'>
                <img
                    src={closeSidebarImage}
                    style={{ rotate: fullLayoutActive ? '180deg' : undefined }}
                    alt='toggleSidebar'
                    width='20px'
                />
            </IconWithTooltip>
            {/* { fullLayoutActive && <p>Exchange Balance</p>} */}
        </section>
    );

    // const titleOpacity = fullLayoutActive ? '0' : '1';

    const columnView = useMediaQuery('(max-width: 1200px)');

    const restrictWidth =
        !isModalView && useMediaQuery('screen and (min-width: 1200px)');
    const restrictWidthStyle = restrictWidth
        ? `${styles.container_restrict_width}`
        : '';

    return (
        <>
            <motion.main
                animate={
                    columnView ? 'open' : fullLayoutActive ? 'closed' : 'open'
                }
                style={{ width: '100%' }}
                className={`${styles.container} ${restrictWidthStyle}`}
            >
                <motion.div className={styles.main_container}>
                    {/* <div style={{ opacity: titleOpacity }} className={styles.title}>
                    Exchange Balance
                </div> */}
                    <div className={styles.tabs_container}>
                        {(!fullLayoutActive || columnView || isModalView) && (
                            <TabComponent
                                data={accountData}
                                rightTabOptions={false}
                            />
                        )}
                        {!isModalView && exchangeControl}
                    </div>
                </motion.div>
                {(!fullLayoutActive || columnView || isModalView) && (
                    <section>
                        <div className={styles.info_text}>
                            Collateral deposited into the Ambient Finance
                            exchange can be traded at lower gas costs.
                            Collateral can be withdrawn at any time.
                        </div>
                    </section>
                )}
            </motion.main>
        </>
    );
}
