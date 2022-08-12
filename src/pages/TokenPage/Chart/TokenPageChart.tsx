/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import AreaChart from '../../../components/Global/Charts/AreaChart';
import BarChart from '../../../components/Global/Charts/BarChart';
import CandleChart from '../../../components/Global/Charts/CandleChart';
import { TokenData } from '../../../state/tokens/models';
import { formatDollarAmount } from '../../../utils/numbers';
import styles from './TokenPageChart.module.css';

interface TokenPageChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tvlData?: any;
    priceData?: any;
    volumeData?: any;
    token?: TokenData;
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

export default function TokenPageChart(props: TokenPageChartProps) {
    const [activeTab, setActiveTab] = useState('tvl');
    const tabData = [
        { title: 'Volume', id: 'vlm' },
        { title: 'TVL', id: 'tvl' },
        { title: 'Price', id: 'price' },
    ];
    const [latestValue, setLatestValue] = useState<number | undefined>();
    const [valueLabel, setValueLabel] = useState<string | undefined>();

    return (
        <div className={styles.cqwlBw}>
            <div className={styles.jnaQPQ}>
                <div className={styles.ktegKV}>
                    <label className={styles.eJnjNO}>
                        {latestValue
                            ? activeTab === 'vlm'
                                ? latestValue
                                : formatDollarAmount(latestValue, 2)
                            : formatDollarAmount(props.token?.priceUSD, 2)}
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
                <AreaChart
                    data={props.tvlData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            ) : activeTab === 'vlm' ? (
                <BarChart
                    data={props.volumeData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                    snapType={'days'}
                />
            ) : (
                <CandleChart
                    data={props.priceData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            )}
        </div>
    );
}
