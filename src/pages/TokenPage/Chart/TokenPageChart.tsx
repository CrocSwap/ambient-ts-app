/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import dayjs from 'dayjs';
import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { useTokenPriceData } from '../../../state/tokens/hooks';
import { TokenData } from '../../../state/tokens/models';
import { unixToDate } from '../../../utils/date';
import { formatDollarAmount } from '../../../utils/numbers';
import PriceChart from './PriceChart/PriceChart';
import styles from './TokenPageChart.module.css';
import TvlChart from './TvlChart/TvlChart';
import VolumeChart from './VolumeChart/VolumeChart';

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
    const data = props.tvlData;
    const [activeTab, setActiveTab] = useState('price');
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
                    {tabData.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'tvl' ? (
                <TvlChart
                    data={data}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            ) : activeTab === 'vlm' ? (
                <VolumeChart
                    data={props.volumeData}
                    value={latestValue}
                    label={valueLabel}
                    setValue={setLatestValue}
                    setLabel={setValueLabel}
                />
            ) : (
                <PriceChart
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
