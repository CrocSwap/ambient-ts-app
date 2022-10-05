import styles from './ExchangeBalance.module.css';

import Deposit from './Deposit/Deposit';
import Withdraw from './Withdraw/Withdraw';
import Transfer from './Transfer/Transfer';

import transferImage from '../../../assets/images/sidebarImages/transfer.svg';
import withdrawImage from '../../../assets/images/sidebarImages/withdraw.svg';
import depositImage from '../../../assets/images/sidebarImages/deposit.svg';
import TabComponent from '../../Global/TabComponent/TabComponent';

import { SetStateAction, Dispatch, useState, useEffect } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';

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
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;
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
                }
            } else if (sendToAddress && isSendToAddressHex && !isSendToAddressEns) {
                setResolvedAddress(sendToAddress);
            } else {
                setResolvedAddress(undefined);
            }
        })();
    }, [sendToAddress, isSendToAddressHex, isSendToAddressEns, mainnetProvider]);

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
                />
            ),
            icon: transferImage,
        },
    ];

    return (
        <div className={styles.main_container}>
            {/* <div className={styles.title}>Exchange Balance</div> */}

            <div className={styles.tabs_container}>
                <TabComponent
                    data={accountData}
                    rightTabOptions={false}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    setOutsideControl={setOutsideControl}
                    outsideControl={false}
                    selectedOutsideTab={0}
                />
            </div>
            <div className={styles.info_text}>
                {' '}
                Collateral stored on the Ambient Finance exchange reduces gas costs when making
                transactions. Collateral can be withdrawn at any time.
            </div>
        </div>
    );
}
