import styles from './ReceiptDisplay.module.css';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdErrorOutline } from 'react-icons/md';
import trimString from '../../../../utils/functions/trimString';
import { RiExternalLinkLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { VscClose } from 'react-icons/vsc';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { removeReceipt } from '../../../../utils/state/receiptDataSlice';
import { getChainExplorer } from '../../../../utils/data/chains';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import Spinner from '../../Spinner/Spinner';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';

interface ReceiptDisplayPropsIF {
    status: 'successful' | 'failed' | 'pending';
    hash: string;
    txBlockNumber?: number;
    txType: string | undefined;
}

export default function ReceiptDisplay(props: ReceiptDisplayPropsIF) {
    const { status, hash, txBlockNumber, txType } = props;
    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);

    const { cachedFetchBlockTime } = useContext(CachedDataContext);

    const pending = <Spinner size={30} bg={'var(--dark2)'} weight={2} />;
    const failed = <MdErrorOutline size={30} color='#7371fc ' />;
    const success = <IoMdCheckmarkCircleOutline size={30} color='#7371fc ' />;

    function handleStatusDisplay(status: string) {
        if (status === 'successful') {
            return success;
        } else if (status === 'failed') {
            return failed;
        } else return pending;
    }

    const txHashTruncated = trimString(hash, 6, 0, '…');

    // This function would later on return info about the tx such as 'Swap 0.0001 ETH for 0321 DAI
    function handleTxTextDisplay(status: string) {
        if (status === 'successful') {
            return 'Completed';
        } else if (status === 'failed') {
            return 'Failed';
        } else return '';
    }

    const blockExplorer = getChainExplorer(chainId);
    const EtherscanTx = `${blockExplorer}tx/${hash}`;

    const dispatch = useAppDispatch();

    const [blockTime, setBlockTime] = useState<number | undefined>();

    useEffect(() => {
        (async () => {
            const blockTime =
                provider && txBlockNumber
                    ? await cachedFetchBlockTime(provider, txBlockNumber)
                    : undefined;
            if (blockTime) setBlockTime(blockTime);
        })();
    }, [provider, txBlockNumber]);

    const elapsedTimeInSecondsNum = blockTime
        ? Date.now() / 1000 - blockTime
        : undefined;

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 minute ago'
                : elapsedTimeInSecondsNum < 120
                ? '1 minute ago'
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} minutes ago `
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour ago'
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hours ago `
                : elapsedTimeInSecondsNum < 172800
                ? '1 day ago'
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days ago `
            : 'Pending...';

    const ariaLabel = `${status} transaction of ${txType}`;

    return (
        <motion.div
            layout
            initial={{ scale: 0.4, opacity: 0, y: 50 }}
            exit={{
                scale: 0,
                opacity: 0,
                transition: { duration: 0.2 },
            }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={styles.container}
            tabIndex={0}
            role='listitem'
            aria-label={ariaLabel}
        >
            <div className={styles.status}>{handleStatusDisplay(status)}</div>
            <div className={styles.content}>
                <div className={styles.info}>
                    <div className={styles.row}>
                        {`${
                            txType ? txType : 'Transaction'
                        } (${txHashTruncated})`}
                        <button
                            style={{
                                cursor: 'pointer',
                                background: 'transparent',
                                outline: 'none',
                                border: 'none',
                            }}
                            tabIndex={0}
                            aria-label='Remove from notification center'
                        >
                            <VscClose
                                onClick={() => {
                                    dispatch(removeReceipt(hash));
                                }}
                                size={20}
                            />
                        </button>
                    </div>
                </div>
                <div className={styles.row}>
                    <p>{`${handleTxTextDisplay(
                        status,
                    )}  ${elapsedTimeString}`}</p>
                    <a
                        href={EtherscanTx}
                        className={styles.action}
                        target='_blank'
                        rel='noreferrer'
                        tabIndex={0}
                        aria-label='View on Etherscan'
                    >
                        <RiExternalLinkLine size={20} color='#7371fc ' />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
