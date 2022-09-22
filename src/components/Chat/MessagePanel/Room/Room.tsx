/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Room.module.css';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { targetData } from '../../../../utils/state/tradeDataSlice';
import def from 'ajv/dist/vocabularies/applicator/additionalItems';
import { RiArrowDownSLine, RiStarSFill, RiStarLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';

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
    pinnedMaxPriceDisplayTruncated: number;
    pinnedMinPriceDisplayTruncated: number;
}

interface RoomProps {
    favePools: PoolIF[];
    selectedRoom: string;
    setRoom: any;
    currentPool: currentPoolInfo;
}
export default function RoomDropdown(props: RoomProps) {
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
            value: currentPool.baseToken.symbol + currentPool.quoteToken.symbol,
        },
    ];
    useEffect(() => {
        defaultRooms.pop;
        defaultRooms.push({
            id: 101,
            name: 'Current Pool',
            value: currentPool.baseToken.symbol + currentPool.quoteToken.symbol,
        });
    }, [currentPool.baseToken.symbol, currentPool.quoteToken.symbol]);

    const rooms = props.favePools;
    const [isActive, setIsActive] = useState(false);
    function handleDropdownMenu() {
        setIsActive(!isActive);
    }

    function handleRoomClick(event: any) {
        props.setRoom(event.target.dataset.value);
        handleDropdownMenu();
        console.log(event.target.dataset.value);
    }

    function handleShowRooms(room: string) {
        if (room === 'Global') {
            return '';
        } else {
            return <RiStarLine className={styles.star_icon} />;
        }
    }

    function handleShowSelectedRoom(selectedRoom: string) {
        if (selectedRoom === 'Global') {
            return '';
        } else {
            return <RiStarSFill className={styles.star_icon_selected_room} />;
        }
    }

    return (
        <div className={styles.dropdown}>
            <div className={styles.dropdown_btn} onClick={(e: any) => handleDropdownMenu()}>
                {props.selectedRoom}
                {handleShowSelectedRoom(props.selectedRoom)}
                <RiArrowDownSLine className={styles.star_icon} />
            </div>

            {isActive && (
                <div className={styles.dropdow_content}>
                    <div className={styles.item}>
                        {rooms.map((pool: PoolIF, i) => (
                            <div
                                className={styles.dropdown_item}
                                key={i}
                                data-value={pool.base.symbol + pool.quote.symbol}
                                data-icon='glyphicon glyphicon-eye-open'
                                onClick={(event: any) => handleRoomClick(event)}
                            >
                                <RiStarSFill className={styles.star_icon} /> {pool.base.symbol}
                                {pool.quote.symbol}
                            </div>
                        ))}
                        {defaultRooms.map((tab) => (
                            <div
                                className={styles.dropdown_item}
                                key={tab.id}
                                data-value={tab.value}
                                onClick={(event: any) => handleRoomClick(event)}
                            >
                                {handleShowRooms(tab.name)}
                                {tab.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
