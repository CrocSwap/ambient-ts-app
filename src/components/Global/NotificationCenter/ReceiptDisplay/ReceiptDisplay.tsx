import styles from './ReceiptDisplay.module.css';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { MdErrorOutline } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import trimString from '../../../../utils/functions/trimString';
import { RiExternalLinkLine } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { VscClose } from 'react-icons/vsc';
interface ReceiptDisplayPropsIF {
    status: 'successful' | 'failed' | 'pending';
    hash: string;
    txBlockNumber?: number;
    lastBlockNumber: number;
}
export default function ReceiptDisplay(props: ReceiptDisplayPropsIF) {
    const { status, hash, txBlockNumber, lastBlockNumber } = props;
    const pending = (
        <div className={styles.pending}>
            <AiOutlineLoading3Quarters />
        </div>
    );
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
            return 'completed';
        } else if (status === 'failed') {
            return 'failed';
        } else return 'submitted';
    }

    const EtherscanTx = `https://goerli.etherscan.io/tx/${hash}`;

    const elapsedTimeInSecondsNum = txBlockNumber
        ? (lastBlockNumber - txBlockNumber) * 13.75 // 13.75 seconds average between blocks
        : undefined;

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 minute ago'
                : elapsedTimeInSecondsNum < 120
                ? '1 minute ago'
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} minutes ago`
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour ago'
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hours ago`
                : elapsedTimeInSecondsNum < 172800
                ? '1 day ago'
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days ago`
            : 'Pending...';

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
        >
            <div className={styles.status}>{handleStatusDisplay(status)}</div>
            <div className={styles.content}>
                <div className={styles.info}>
                    <div className={styles.row}>
                        Transaction {txHashTruncated} {handleTxTextDisplay(status)}
                        <div>
                            <VscClose size={20} />
                        </div>
                    </div>
                </div>
                <div className={styles.row}>
                    <p> {`  ${elapsedTimeString}`}</p>
                    <a
                        href={EtherscanTx}
                        className={styles.action}
                        target='_blank'
                        rel='noreferrer'
                    >
                        <RiExternalLinkLine size={20} color='#7371fc ' />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
