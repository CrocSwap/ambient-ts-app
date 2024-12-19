import { Provider } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdErrorOutline } from 'react-icons/md';
import { RiExternalLinkLine } from 'react-icons/ri';
import { VscClose } from 'react-icons/vsc';
import {
    getChainExplorer,
    trimString,
} from '../../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../../contexts';
import { CachedDataContext } from '../../../../contexts/CachedDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import Spinner from '../../Spinner/Spinner';
import styles from './ReceiptDisplay.module.css';

interface ReceiptDisplayPropsIF {
    status: 'successful' | 'failed' | 'pending';
    hash: string;
    provider?: Provider;
    txBlockNumber?: number;
    txType: string | undefined;
    chainId: string | undefined;
}

export default function ReceiptDisplay(props: ReceiptDisplayPropsIF) {
    const { status, hash, txBlockNumber, provider, txType, chainId } = props;
    const {
        activeNetwork: { chainId: currentChainId },
    } = useContext(AppStateContext);

    const { cachedFetchBlockTime } = useContext(CachedDataContext);
    const { removeReceipt } = useContext(ReceiptContext);

    const blockExplorer = getChainExplorer(chainId ?? currentChainId);
    const EtherscanTx = `${blockExplorer}tx/${hash}`;

    const handleNavigateEtherscan = () => {
        window.open(EtherscanTx, '_blank');
    };

    const pending = <Spinner size={30} bg={'var(--dark2)'} weight={2} />;
    const failed = <MdErrorOutline size={30} color='var(--accent1)' />;
    const success = (
        <IoMdCheckmarkCircleOutline
            size={30}
            color='var(--accent1)'
            onClick={handleNavigateEtherscan}
        />
    );

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

    const [blockTime, setBlockTime] = useState<number | undefined>();

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        const maxDuration = 30000; // 30 seconds in milliseconds
        const pollingInterval = 2000; // 2 seconds in milliseconds

        const fetchBlockTime = async () => {
            const blockTime =
                provider && txBlockNumber
                    ? await cachedFetchBlockTime(provider, txBlockNumber)
                    : undefined;

            if (blockTime !== undefined) {
                setBlockTime(blockTime);
                clearInterval(intervalId); // Stop polling
                clearTimeout(timeoutId); // Clear the timeout
            }
        };

        if (provider && txBlockNumber) {
            fetchBlockTime();
            // Start polling every 2 seconds
            intervalId = setInterval(fetchBlockTime, pollingInterval);

            // Set a timeout to stop polling after 30 seconds
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                console.log('Stopped polling: maximum duration reached.');
            }, maxDuration);
        }

        // Cleanup to prevent memory leaks
        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [provider, txBlockNumber, cachedFetchBlockTime]);

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
            : status === 'pending'
              ? 'Pending...'
              : '';

    return (
        <div className={styles.nContainer}>
            <a
                href={EtherscanTx}
                className={styles.leftSide}
                target='_blank'
                rel='noreferrer'
                tabIndex={0}
                aria-label='View on Block Explorer'
            >
                <div className={styles.status}>
                    {handleStatusDisplay(status)}
                </div>
                <div className={styles.column}>
                    {`${txType ? txType : 'Transaction'} (${txHashTruncated})`}
                    <p>{`${handleTxTextDisplay(status)}  ${elapsedTimeString}`}</p>
                </div>
            </a>
            <div className={`${styles.column} ${styles.alignEnd}`}>
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
                            removeReceipt(hash);
                        }}
                        size={20}
                    />
                </button>
                <a
                    href={EtherscanTx}
                    className={styles.action}
                    target='_blank'
                    rel='noreferrer'
                    tabIndex={0}
                    aria-label='View on Block Explorer'
                >
                    <RiExternalLinkLine size={20} color='var(--accent1)' />
                </a>
            </div>
        </div>
    );
}
