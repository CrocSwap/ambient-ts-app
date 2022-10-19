/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Room.module.css';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { targetData } from '../../../../utils/state/tradeDataSlice';
import { useEffect } from 'react';

interface currentPoolInfo {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitPrice: string;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
}

interface RoomProps {
    favePools: PoolIF[];
    selectedRoom: string;
    setRoom: any;
    currentPool: currentPoolInfo;
}

export default function Room(props: RoomProps) {
    const { currentPool } = props;

    const defaultRooms = [
        {
            id: 100,
            name: 'Global',
            value: 'Global',
        },
        {
            id: 101,
            name: 'Current Pool',
            value: 'Current Pool',
        },
    ];

    useEffect(() => {
        defaultRooms.pop;
        defaultRooms.push({
            id: 101,
            name: 'Current Pool',
            value: 'Current Pool',
        });
    }, [currentPool.baseToken.symbol, currentPool.quoteToken.symbol]);

    const rooms = props.favePools;
    return (
        <div className={styles.room_body}>
            <select
                className={styles.dropdown}
                onChange={(event: any) => {
                    props.setRoom(event.target.value);
                }}
                defaultValue={props.selectedRoom}
            >
                {defaultRooms.map((tab) => (
                    <option className={styles.dropdown_item} key={tab.id} value={tab.value}>
                        {tab.name}
                    </option>
                ))}
                {rooms.map((pool: PoolIF, i) => (
                    <option
                        className={styles.dropdown_item}
                        key={i}
                        value={pool.base.symbol + pool.quote.symbol}
                    >
                        {pool.base.symbol} / {pool.quote.symbol}
                    </option>
                ))}
            </select>
        </div>
    );
}
