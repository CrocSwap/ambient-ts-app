import styles from './ExchangeBalance.module.css';

import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';
import vaultImage from '../../../assets/images/sidebarImages/vault.svg';
import closeSidebarImage from '../../../assets/images/sidebarImages/closeSidebar.svg';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';
import { motion } from 'framer-motion';
import { SetStateAction, Dispatch, useState, useEffect } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { fetchAddress } from '../../../App/functions/fetchAddress';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
interface ExchangeBalanceProps {
    crocEnv: CrocEnv | undefined;
    mainnetProvider: ethers.providers.WebSocketProvider;
    connectedAccount: string;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    selectedToken: TokenIF;
    tokenAllowance: string;
    tokenWalletBalance: string;
    tokenDexBalance: string;
    setRecheckTokenAllowance: Dispatch<SetStateAction<boolean>>;
    fullLayoutActive: boolean;
    setFullLayoutActive: Dispatch<SetStateAction<boolean>>;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
    openTokenModal: () => void;
    selectedTokenDecimals: number;
    gasPriceInGwei: number | undefined;
}

export default function ExchangeBalance(props: ExchangeBalanceProps) {
    const {
        crocEnv,
        mainnetProvider,
        connectedAccount,
        openGlobalModal,
        closeGlobalModal,
        setSelectedOutsideTab,
        setOutsideControl,
        selectedToken,
        tokenAllowance,
        tokenWalletBalance,
        tokenDexBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
        lastBlockNumber,
        openTokenModal,
        fullLayoutActive,
        setFullLayoutActive,
        selectedTokenDecimals,
        gasPriceInGwei,
    } = props;

    const [sendToAddress, setSendToAddress] = useState<string | undefined>();
    const [resolvedAddress, setResolvedAddress] = useState<string | undefined>();

    const isSendToAddressEns = sendToAddress?.endsWith('.eth');
    const isSendToAddressHex = sendToAddress?.startsWith('0x') && sendToAddress?.length == 42;

    useEffect(() => {
        (async () => {
            if (sendToAddress && isSendToAddressEns && mainnetProvider) {
                const newResolvedAddress = await mainnetProvider.resolveName(sendToAddress);

                if (newResolvedAddress) {
                    setResolvedAddress(newResolvedAddress);
                } else {
                    setResolvedAddress(undefined);
                }
            } else if (sendToAddress && isSendToAddressHex && !isSendToAddressEns) {
                setResolvedAddress(sendToAddress);
            } else {
                setResolvedAddress(undefined);
            }
        })();
    }, [sendToAddress, isSendToAddressHex, isSendToAddressEns, mainnetProvider]);

    const [secondaryEnsName, setSecondaryEnsName] = useState<string | undefined>();

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
                    const ensName = await fetchAddress(mainnetProvider, sendToAddress, '0x1');
                    if (ensName) {
                        setSecondaryEnsName(ensName);
                    } else setSecondaryEnsName(undefined);
                } catch (error) {
                    setSecondaryEnsName(undefined);
                    console.log({ error });
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
                    crocEnv={crocEnv}
                    connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    selectedToken={selectedToken}
                    tokenAllowance={tokenAllowance}
                    tokenWalletBalance={tokenWalletBalance}
                    tokenDexBalance={tokenDexBalance}
                    setRecheckTokenAllowance={setRecheckTokenAllowance}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    openTokenModal={openTokenModal}
                    selectedTokenDecimals={selectedTokenDecimals}
                    gasPriceInGwei={gasPriceInGwei}
                />
            ),
            icon: depositImage,
        },
        {
            label: 'Withdraw',
            content: (
                <Withdraw
                    crocEnv={crocEnv}
                    connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    selectedToken={selectedToken}
                    tokenWalletBalance={tokenWalletBalance}
                    tokenDexBalance={tokenDexBalance}
                    lastBlockNumber={lastBlockNumber}
                    setRecheckTokenBalances={setRecheckTokenBalances}
                    sendToAddress={sendToAddress}
                    resolvedAddress={resolvedAddress}
                    setSendToAddress={setSendToAddress}
                    secondaryEnsName={secondaryEnsName}
                    openTokenModal={openTokenModal}
                    gasPriceInGwei={gasPriceInGwei}
                />
            ),
            icon: withdrawImage,
        },
        {
            label: 'Transfer',
            content: (
                <Transfer
                    crocEnv={crocEnv}
                    // connectedAccount={connectedAccount}
                    openGlobalModal={openGlobalModal}
                    closeGlobalModal={closeGlobalModal}
                    selectedToken={selectedToken}
                    tokenDexBalance={tokenDexBalance}
                    lastBlockNumber={lastBlockNumber}
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
                    src={!fullLayoutActive ? closeSidebarImage : vaultImage}
                    alt='toggleSidebar'
                    width='20px'
                />
            </IconWithTooltip>
            {/* { fullLayoutActive && <p>Exchange Balance</p>} */}
        </section>
    );

    // const titleOpacity = fullLayoutActive ? '0' : '1';
    return (
        <motion.main
            animate={fullLayoutActive ? 'closed' : 'open'}
            style={{ width: '100%' }}
            className={styles.container}
        >
            <motion.div className={styles.main_container}>
                {/* <div style={{ opacity: titleOpacity }} className={styles.title}>
                    Exchange Balance
                </div> */}
                <div className={styles.tabs_container}>
                    {!fullLayoutActive && (
                        <TabComponent
                            data={accountData}
                            rightTabOptions={false}
                            setSelectedOutsideTab={setSelectedOutsideTab}
                            setOutsideControl={setOutsideControl}
                            outsideControl={false}
                            selectedOutsideTab={0}
                        />
                    )}
                    {exchangeControl}
                </div>
                {!fullLayoutActive && (
                    <>
                        <div className={styles.info_text}>
                            Collateral deposited into the Ambient Finance exchange contract can be
                            traded at lower gas costs.
                        </div>
                        <div className={styles.info_text}>
                            {' '}
                            Collateral can be withdrawn at any time.
                        </div>
                    </>
                )}
            </motion.div>
        </motion.main>
    );
}
