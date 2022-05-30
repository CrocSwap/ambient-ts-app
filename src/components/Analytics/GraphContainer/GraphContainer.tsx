import styles from './GraphContainer.module.css';
import chartImage from '../../../assets/images/Temporary/Analytics/chart.svg';
import { motion } from 'framer-motion';

export default function GraphContainer() {
    const timeFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Ambient Analytics</div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                <button>1m</button>
                <button>5m</button>
                <button>15m</button>
                <button>1h</button>
                <button>4h</button>
                <button>1d</button>
            </div>
        </div>
    );

    const graphData = (
        <div className={styles.graph_data}>
            <div className={styles.graph_container}>
                <div className={styles.title}>Total TVL</div>
                <div className={styles.image_container}>
                    <motion.img
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ x: innerWidth, transition: { duration: 5 } }}
                        src={chartImage}
                        alt='chart'
                    />
                </div>
            </div>
            <div className={styles.graph_container}>
                <div className={styles.title}>Total TVL</div>
                <div className={styles.image_container}>
                    <motion.img
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        exit={{ x: innerWidth, transition: { duration: 5 } }}
                        src={chartImage}
                        alt='chart'
                    />
                </div>
            </div>
        </div>
    );

    const analyticsInfo = (
        <div className={styles.info_container}>
            <div className={styles.info_content}>
                <div className={styles.info_title}>Total TVL</div>
                <div className={styles.info_value}>$1,000,000</div>
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Volume</div>
                <div className={styles.info_value}>$1,000,000</div>
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Fees</div>
                <div className={styles.info_value}>$1,000,000</div>
            </div>
        </div>
    );
    return (
        <div className={styles.GraphContainers}>
            {timeFrame}
            {graphData}
            {analyticsInfo}
        </div>
    );
}
