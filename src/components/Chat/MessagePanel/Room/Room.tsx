/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Room.module.css';
import { PoolIF, TokenIF } from '../../../../utils/interfaces/exports';
import { targetData } from '../../../../utils/state/tradeDataSlice';
import { RiArrowDownSLine } from 'react-icons/ri';
// import { BsSuitHeartFill } from 'react-icons/bs';
import { useState, useEffect } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { topPools } from '../../../../App/mockData';

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
    limitTick: number | undefined;
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
    isCurrentPool: any;
    setIsCurrentPool: any;
    showCurrentPoolButton: any;
    setShowCurrentPoolButton: any;
}
export default function RoomDropdown(props: RoomProps) {
    const {
        currentPool,
        isFullScreen,
        isCurrentPool,
        setIsCurrentPool,
        showCurrentPoolButton,
        setShowCurrentPoolButton,
    } = props;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const [roomArray, setRoomArray] = useState<string[]>([]);
    const [favoritePoolsArray, setFavoritePoolsArray] = useState<string[]>([]);
    // const [isCurrentPool, setIsCurrentPool] = useState(false);
    // const [showCurrentPoolButton, setShowCurrentPoolButton] = useState(true);
    const [isHovering, setIsHovering] = useState(false);

    // non-empty space
    const defaultRooms = [
        {
            id: 100,
            name: '   @Global',
            value: 'Global',
        },
        // {
        //     id: 101,
        //     name: 'Current Pool',
        //     value: currentPool.baseToken.symbol + '/' + currentPool.quoteToken.symbol,
        // },
    ];

    const isFullScreenDefaultRooms = [
        {
            id: 100,
            name: '@Global',
            value: 'Global',
        },
    ];

    useEffect(() => {
        if (
            isCurrentPool ||
            props.selectedRoom ===
                currentPool.baseToken.symbol + '/' + currentPool.quoteToken.symbol
        ) {
            setShowCurrentPoolButton(false);
        } else {
            setShowCurrentPoolButton(true);
        }
    }, [
        isCurrentPool,
        currentPool.baseToken.symbol,
        currentPool.quoteToken.symbol,
        props.selectedRoom,
    ]);

    useEffect(() => {
        const roomArr: string[] = [];
        const favePoolsArr: string[] = [];

        favepools?.map((pool: PoolIF) => {
            favePoolsArr.push(pool.base.symbol + '/' + pool.quote.symbol);
        });

        setFavoritePoolsArray(() => {
            return favePoolsArr;
        });

        rooms?.map((pool: PoolIF) => {
            roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
        });

        for (let x = 0; x < roomArr.length; x++) {
            if (!favePoolsArr.includes(roomArr[x])) {
                roomArr.push(roomArr.splice(x, 1)[0]);
            } else {
                // do nothing
            }
        }

        setRoomArray(() => {
            return roomArr;
        });

        const middleIndex = Math.ceil(roomArray.length / 2);
        roomArray.splice(0, middleIndex);
    }, []);

    const rooms = topPools;
    const favepools = props.favePools;

    useEffect(() => {
        if (props.selectedRoom === 'Global') {
            const roomArr: string[] = [];
            rooms?.map((pool: PoolIF) => {
                roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
            });

            for (let x = 0; x < roomArr.length; x++) {
                if (!favoritePoolsArray.includes(roomArr[x])) {
                    roomArr.push(roomArr.splice(x, 1)[0]);
                } else {
                    // do nothing
                }
            }

            setRoomArray(() => {
                return roomArr;
            });
        } else {
            if (isCurrentPool) {
                const roomArr: string[] = [];
                rooms.map((pool: PoolIF) => {
                    roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
                });
                for (let x = 0; x < roomArr.length; x++) {
                    if (!favoritePoolsArray.includes(roomArr[x])) {
                        roomArr.push(roomArr.splice(x, 1)[0]);
                    } else {
                        // do nothing
                    }
                }
                setRoomArray(() => {
                    return roomArr;
                });
                const index = roomArr.indexOf(props.selectedRoom);
                roomArr.splice(index, 1);
                if (index > -1) {
                    // only splice array when item is found

                    for (let x = 0; x < roomArr.length; x++) {
                        if (!favoritePoolsArray.includes(roomArr[x])) {
                            roomArr.push(roomArr.splice(x, 1)[0]);
                        } else {
                            // do nothing
                        }
                    }

                    setRoomArray(() => {
                        return roomArr;
                    });
                }
            } else {
                const roomArr: string[] = [];
                rooms.map((pool: PoolIF) => {
                    roomArr.push(pool.base.symbol + '/' + pool.quote.symbol);
                });

                for (let x = 0; x < roomArr.length; x++) {
                    if (!favoritePoolsArray.includes(roomArr[x])) {
                        roomArr.push(roomArr.splice(x, 1)[0]);
                    } else {
                        // do nothing
                    }
                }

                setRoomArray(() => {
                    return roomArr;
                });
                const index = roomArr.indexOf(props.selectedRoom);
                roomArr.splice(index, 1);
                if (index > -1) {
                    for (let x = 0; x < roomArr.length; x++) {
                        if (!favoritePoolsArray.includes(roomArr[x])) {
                            roomArr.push(roomArr.splice(x, 1)[0]);
                        } else {
                            // do nothing
                        }
                    }

                    // only splice array when item is found
                    setRoomArray(() => {
                        return roomArr;
                    });
                }
            }
        }
    }, [props.selectedRoom, rooms]);

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
        props.setRoom(currentPool.baseToken.symbol + '/' + currentPool.quoteToken.symbol);
        setShowCurrentPoolButton(false);
        setIsActive(false);
        setIsCurrentPool(true);
    }

    function handleShowSelectedRoom(selectedRoom: string) {
        if (selectedRoom === 'Global') {
            return '';
        } else {
            return '';
            // return <BsSuitHeartFill className={styles.star_icon_selected_room} />;
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
                            {tab.name}
                        </div>
                    ));
                }
            }
        } else {
            if (selectedRoom === 'Global') {
                if (rooms.length !== 0) {
                    return '';
                }
            } else {
                return defaultRooms.reverse().map((tab) => (
                    <div
                        className={styles.dropdown_item}
                        key={tab.id}
                        data-value={tab.value}
                        onClick={(event: any) => handleRoomClick(event, tab.name)}
                    >
                        {tab.name}
                    </div>
                ));
            }
        }
    }

    const smallScrenView = useMediaQuery('(max-width: 968px)');

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
                                {favoritePoolsArray.includes(pool) ? (
                                    <svg
                                        width={smallScrenView ? '15px' : '20px'}
                                        height={smallScrenView ? '15px' : '20px'}
                                        viewBox='0 0 15 15'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <g clipPath='url(#clip0_1874_47746)'>
                                            <path
                                                d='M12.8308 3.34315C12.5303 3.04162 12.1732 2.80237 11.7801 2.63912C11.3869 2.47588 10.9654 2.39185 10.5397 2.39185C10.1141 2.39185 9.69255 2.47588 9.29941 2.63912C8.90626 2.80237 8.54921 3.04162 8.24873 3.34315L7.78753 3.81033L7.32633 3.34315C7.02584 3.04162 6.66879 2.80237 6.27565 2.63912C5.8825 2.47588 5.461 2.39185 5.03531 2.39185C4.60962 2.39185 4.18812 2.47588 3.79498 2.63912C3.40183 2.80237 3.04478 3.04162 2.7443 3.34315C1.47451 4.61294 1.39664 6.75721 2.99586 8.38637L7.78753 13.178L12.5792 8.38637C14.1784 6.75721 14.1005 4.61294 12.8308 3.34315Z'
                                                fill={'#6b6f7d'}
                                                // fill={isButtonFavorited ? '#EBEBFF' : 'none'}
                                                stroke='#6b6f7d'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id='clip0_1874_47746'>
                                                <rect
                                                    width='14'
                                                    height='14'
                                                    fill='white'
                                                    transform='translate(0.600098 0.599976)'
                                                />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                ) : (
                                    ''
                                )}

                                {/* {favePools.includes(pool) ?  pool : '  \t'+pool} */}
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
