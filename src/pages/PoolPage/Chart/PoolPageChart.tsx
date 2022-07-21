import dayjs from 'dayjs';
import { DetailedHTMLProps, HTMLAttributes, useState } from 'react';
import { PoolData } from '../../../state/pools/models';
import { formatDollarAmount } from '../../../utils/numbers';
import TvlChart from '../../TokenPage/Chart/TvlChart/TvlChart';
import VolumeChart from '../../TokenPage/Chart/VolumeChart/VolumeChart';
import styles from './PoolPageChart.module.css';

interface PoolPageChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tvlData?: any;
    feesData?: any;
    volumeData?: any;
    pool?: PoolData;
    valueLabel?: string | undefined;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            'd3fc-svg': DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        }
    }
}

export default function PoolPageChart(props: PoolPageChartProps) {
    const [activeTab, setActiveTab] = useState('vlm');
    const tabData = [
        { title: 'Volume', id: 'vlm' },
        { title: 'TVL', id: 'tvl' },
        { title: 'Liquidity', id: 'liq' },
        { title: 'Fees', id: 'fee' },
    ];
    const [latestValue, setLatestValue] = useState<number | undefined>();
    const [valueLabel, setValueLabel] = useState<string | undefined>();

    return (
        <div className={styles.cqwlBw}>
            <div className={styles.jnaQPQ}>
                <div className={styles.ktegKV}>
                    <label className={styles.eJnjNO}>
                        {latestValue
                            ? activeTab === 'vlm' || activeTab === 'fee'
                                ? latestValue
                                : formatDollarAmount(latestValue, 2)
                            : formatDollarAmount(props.pool?.volumeUSD, 2)}
                    </label>
                    <label className={styles.v4m1wv}>
                        {valueLabel
                            ? activeTab === 'vlm'
                                ? valueLabel
                                : valueLabel + ' (UTC) '
                            : dayjs.utc().format('MMM D, YYYY')}
                    </label>
                </div>
                <div className={styles.settings_container}>
                    {tabData.map((tab, index) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                            style={
                                activeTab === tab.id
                                    ? { background: '#4169E1' }
                                    : { background: 'var(--dark1)' }
                            }
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'tvl' ? (
                <TvlChart
                    data={props.tvlData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            ) : (
                <VolumeChart
                    data={activeTab === 'vlm' ? props.volumeData : props.feesData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            )}
        </div>
    );
}
