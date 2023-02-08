/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Room.module.css';
import { PoolIF, TokenIF } from '../../../../utils/interfaces/exports';
import { targetData } from '../../../../utils/state/tradeDataSlice';
import { RiArrowDownSLine } from 'react-icons/ri';
import { BsSuitHeart, BsSuitHeartFill } from 'react-icons/bs';
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
    limitTick: number;
    advancedLowTick: number;
    advancedHighTick: number;
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
}

interface RoomProps {
    favePools: PoolIF[];
    selectedRoom: any;
    setRoom: any;
    currentPool: currentPoolInfo;
    isFullScreen: boolean;
    room: any;
}
export default function RoomDropdown(props: RoomProps) {
    const { currentPool, isFullScreen } = props;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const [roomArray, setRoomArray] = useState<string[]>([]);
    const [isCurrentPool, setIsCurrentPool] = useState(false);
    const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    const defaultRooms = [
        {
            id: 100,
            name: 'Global',
            value: 'Global',
        },
        {
            id: 101,
            name: 'Current Pool',
            value: currentPool.baseToken.symbol + '/' + currentPool.quoteToken.symbol,
        },
    ];

    const isFullScreenDefaultRooms = [
        {
            id: 100,
            name: 'Global',
            value: 'Global',
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

    useEffect(() => {
        if (isCurrentPool) {
            setShowCurrentPoolButton(false);
        } else {
            setShowCurrentPoolButton(true);
        }
    }, [isCurrentPool, currentPool.baseToken.symbol, currentPool.quoteToken.symbol]);

    useEffect(() => {
        const roomArr: string[] = [];
        rooms?.map((pool: PoolIF) => {
            roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
        });

        setRoomArray(() => {
            return roomArr;
        });
        const middleIndex = Math.ceil(roomArray.length / 2);
        roomArray.splice(0, middleIndex);
    }, []);

    useEffect(() => {
        if (props.selectedRoom === 'Global') {
            const roomArr: string[] = [];
            rooms?.map((pool: PoolIF) => {
                roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
            });
            setRoomArray(() => {
                return roomArr;
            });
        } else {
            const roomArr: string[] = [];
            rooms.map((pool: PoolIF) => {
                roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
            });
            setRoomArray(() => {
                return roomArr;
            });
            const index = roomArr.indexOf(props.selectedRoom);
            roomArr.splice(index, 1);
            if (index > -1) {
                // only splice array when item is found
                setRoomArray(() => {
                    return roomArr;
                });
            }
        }
    }, [props.selectedRoom]);

    const rooms = props.favePools;
    const [isActive, setIsActive] = useState(false);

    const handleMouseOver = () => {
        setIsHovering(true);
    };

    const handleMouseOut = () => {
        setIsHovering(false);
    };

    function handleDropdownMenu() {
        setIsActive(!isActive);
    }

    function handleRoomClick(event: any, name: string) {
        props.setRoom(event.target.dataset.value);
        if (name.toString() === 'Current Pool') {
            setIsCurrentPool(true);
            if (showCurrentPoolButton) {
                setShowCurrentPoolButton(false);
            }
        } else {
            setIsCurrentPool(false);
            setShowCurrentPoolButton(true);
        }

        handleDropdownMenu();
    }

    function handleRoomClickCurrentPool() {
        props.setRoom(currentPool.baseToken.symbol + currentPool.quoteToken.symbol);
        setShowCurrentPoolButton(false);
        setIsActive(false);
    }

    function handleShowRooms(room: string) {
        if (room === 'Global') {
            return '';
        } else {
            return <BsSuitHeartFill className={styles.star_icon} />;
        }
    }

    function handleShowSelectedRoom(selectedRoom: string) {
        if (selectedRoom === 'Global') {
            return '';
        } else {
            return <BsSuitHeartFill className={styles.star_icon_selected_room} />;
        }
    }

    function handleShowRoomsExceptGlobal(selectedRoom: string) {
        if (isFullScreen) {
            if (selectedRoom === 'Global') {
                return (
                    <div
                        className={styles.dropdown_item}
                        key={defaultRooms[1].id}
                        data-value={defaultRooms[1].value}
                        onClick={(event: any) => handleRoomClick(event, 'Global')}
                    ></div>
                );
            } else {
                {
                    return isFullScreenDefaultRooms.map((tab) => (
                        <div
                            className={styles.dropdown_item}
                            key={tab.id}
                            data-value={tab.value}
                            onClick={(event: any) => handleRoomClick(event, tab.name)}
                        >
                            {handleShowRooms(tab.name)}
                            {tab.name}
                        </div>
                    ));
                }
            }
        } else {
            if (selectedRoom === 'Global') {
                return (
                    <div
                        className={styles.dropdown_item}
                        key={defaultRooms[1].id}
                        data-value={defaultRooms[1].value}
                        onClick={(event: any) => handleRoomClick(event, defaultRooms[1].name)}
                    >
                        {handleShowRooms(defaultRooms[1].name)}
                        {defaultRooms[1].name}
                    </div>
                );
            } else {
                {
                    return defaultRooms.reverse().map((tab) => (
                        <div
                            className={styles.dropdown_item}
                            key={tab.id}
                            data-value={tab.value}
                            onClick={(event: any) => handleRoomClick(event, tab.name)}
                        >
                            {handleShowRooms(tab.name)}
                            {tab.name}
                        </div>
                    ));
                }
            }
        }
    }

    return (
        <div className={styles.dropdown}>
            <div className={isActive ? styles.dropdown_btn_isActive : styles.dropdown_btn}>
                <div onClick={() => handleDropdownMenu()} style={{ flexGrow: '1' }}>
                    {props.selectedRoom}
                </div>
                {showCurrentPoolButton ? (
                    <div
                        className={styles.current_pool}
                        onClick={() => handleRoomClickCurrentPool()}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        <div className={isHovering ? styles.bgsalmon : styles.current_pool_text}>
                            Current Pool
                        </div>
                    </div>
                ) : (
                    ''
                )}
                <div onClick={() => handleDropdownMenu()}>
                    {' '}
                    {handleShowSelectedRoom(props.selectedRoom)}
                </div>
                <div onClick={() => handleDropdownMenu()}>
                    <RiArrowDownSLine className={styles.star_icon} id='room dropdown' />
                </div>
            </div>
            {isActive && (
                <div className={styles.dropdow_content}>
                    <div className={styles.item}>
                        {roomArray.map((pool, i) => (
                            <div
                                className={styles.dropdown_item}
                                key={i}
                                data-value={pool}
                                data-icon='glyphicon glyphicon-eye-open'
                                onClick={(event: any) => handleRoomClick(event, pool)}
                            >
                                <BsSuitHeart className={styles.star_icon} />

                                {pool}
                            </div>
                        ))}

                        {handleShowRoomsExceptGlobal(props.selectedRoom)}
                    </div>
                </div>
            )}
        </div>
    );
}
