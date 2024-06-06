import React from 'react';
import styles from './DetailsContent.module.css';
import { FiClock } from 'react-icons/fi';
import { CiCircleCheck } from 'react-icons/ci';
import { TfiArrowCircleUp } from 'react-icons/tfi';
import ProgressBar from '../ProgressBar/ProgressBar';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

export default function DetailsContent() {
    const smallHeight = useMediaQuery('(max-height: 800px)');

    const token = 'Bitcoin';
    const subName = 'HarryPotterObamaSonic10Inu';
    const subDetails =
        'HarryPotterObamaSonic10Inu (Ticker: BITCOIN) is a endgame of crypto-assets (0 Tax). BITCOIN incentivizes the creation of novel and entertaining meme content.';

    const timeRow = (
        <div className={styles.timeRow}>
            <FiClock size={24} />
            <p className={styles.rowLabel}>Time Remaining</p>
            <p className={styles.timeRowValue}>15h:45m:32s</p>
        </div>
    );
    const filledBid = (
        <div className={styles.filledBid}>
            <CiCircleCheck size={24} color='#0CCDFF' />
            <p className={styles.rowLabel}>Filled Bid</p>
            <p className={styles.filledValue}>
                $20,000
                <span>FDV</span>
            </p>
        </div>
    );

    const openedBid = (
        <div className={styles.openedContainer}>
            <div className={styles.openedBid}>
                <TfiArrowCircleUp size={24} color='#15BE6F' />

                <p className={styles.rowLabel}>Open Bid</p>
                <p className={styles.filledValue}>
                    $30,000
                    <span>FDV</span>
                </p>
            </div>
            <div className={styles.progressContainer}>
                <ProgressBar value={70} />
                <p>$2,500 / $5,000</p>
            </div>
        </div>
    );

    const img =
        'https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp';

    const compactTokenDisplay = (
        <div className={styles.compactTokenComponent}>
            <div className={styles.imgContainer}>
                <div className={styles.compactImg}>
                    <img src={img} alt='' />
                </div>
                <p className={styles.subName}>
                    {/* {trimString(subName, 10, 3, '…')} */}
                    {/* {subName} */}
                </p>
            </div>
        </div>
    );
    return (
        <div className={styles.container}>
            {smallHeight ? (
                compactTokenDisplay
            ) : (
                <h3 className={styles.token}>{token}</h3>
            )}
            <p className={styles.subName}>{subName}</p>
            <p className={styles.subDetails}>{subDetails}</p>
            <section className={styles.rowsContainer}>
                {timeRow}
                {filledBid}
                {openedBid}
            </section>
        </div>
    );
}
