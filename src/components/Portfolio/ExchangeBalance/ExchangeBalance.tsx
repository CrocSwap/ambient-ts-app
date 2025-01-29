import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { fetchEnsAddress } from '../../../ambient-utils/api';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import TabComponent from '../../Global/TabComponent/TabComponent';
import Deposit from './Deposit/Deposit';
import styles from './ExchangeBalance.module.css';
import Transfer from './Transfer/Transfer';
import Withdraw from './Withdraw/Withdraw';

import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../contexts/UserDataContext';

interface propsIF {
    fullLayoutActive: boolean;
    setFullLayoutActive: Dispatch<SetStateAction<boolean>>;
    setTokenModalOpen?: Dispatch<SetStateAction<boolean>>;
    isModalView?: boolean;
    setIsAutoLayout?: Dispatch<SetStateAction<boolean>> | undefined;
}

export default function ExchangeBalance(props: propsIF) {
    const {
        fullLayoutActive,
        setFullLayoutActive,
        isModalView = false,
        setTokenModalOpen = () => null,
        setIsAutoLayout,
    } = props;

    const { mainnetProvider } = useContext(CrocEnvContext);

    const { soloToken: selectedToken } = useContext(TradeDataContext);

    const { userAddress } = useContext(UserDataContext);

    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { setTokenBalance } = useContext(TokenBalanceContext);

    const [tokenAllowance, setTokenAllowance] = useState<bigint | undefined>();
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

    const isSendToAddressEns = sendToAddress?.endsWith('.eth');
    const isSendToAddressHex =
        sendToAddress?.startsWith('0x') && sendToAddress?.length == 42;

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;

    useEffect(() => {
        setTokenWalletBalance('');
        setTokenDexBalance('');
    }, [selectedToken.address, userAddress]);

    useEffect(() => {
        if (crocEnv && selectedToken.address && userAddress) {
            crocEnv
                .token(selectedToken.address)
                .wallet(userAddress)

                .then((bal: bigint) => {
                    setTokenWalletBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        walletBalance: bal.toString(),
                    });
                })
                .catch(console.error);

            crocEnv
                .token(selectedToken.address)
                .balance(userAddress)
                .then((bal: bigint) => {
                    setTokenDexBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        dexBalance: bal.toString(),
                    });
                })
                .catch(console.error);
        }
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
                    setTokenAllowance(allowance);
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
                const newResolvedAddress =
                    await mainnetProvider.resolveName(sendToAddress);

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
                sendToAddress.startsWith('0x')
            ) {
                try {
                    const ensName = await fetchEnsAddress(sendToAddress);
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
                    selectedTokenDecimals={selectedTokenDecimals}
                    setTokenModalOpen={setTokenModalOpen}
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
                    setTokenModalOpen={setTokenModalOpen}
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
                    setTokenModalOpen={setTokenModalOpen}
                />
            ),
            icon: transferImage,
        },
    ];
    const toggleFullLayoutActive = () => {
        setFullLayoutActive(!fullLayoutActive);
        setIsAutoLayout && setIsAutoLayout(false); // Mark that the layout is now manually controlled
    };
    const exchangeControl = (
        <div
            className={styles.portfolio_control_container}
            id='portfolio_sidebar_toggle'
            onClick={toggleFullLayoutActive}
        >
            <IconWithTooltip title='Exchange Balance' placement='bottom'>
                <img
                    src={closeSidebarImage}
                    style={{ rotate: fullLayoutActive ? '180deg' : undefined }}
                    alt='toggleSidebar'
                    width='20px'
                />
            </IconWithTooltip>
        </div>
    );

    return (
        <div className={styles.portfolio_motion_container}>
            <div className={styles.portfolio_motion_sub_container} id='subcont'>
                <div className={styles.tab_component_container}>
                    {(!fullLayoutActive || isModalView) && (
                        <TabComponent
                            data={accountData}
                            rightTabOptions={false}
                            isModalView={isModalView}
                            shouldSyncWithTradeModules={false}
                        />
                    )}
                    {!isModalView && exchangeControl}
                </div>
            </div>
            {(!fullLayoutActive || isModalView) && (
                <p className={styles.portfolio_info_text}>
                    Collateral deposited into the Ambient Finance exchange can
                    be traded at lower gas costs and withdrawn at any time.
                </p>
            )}
        </div>
    );
}
