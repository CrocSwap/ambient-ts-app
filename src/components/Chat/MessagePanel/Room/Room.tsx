/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './Room.module.css';
import { PoolIF } from '../../../../utils/interfaces/exports';
import { RiArrowDownSLine } from 'react-icons/ri';
import { useState, useEffect, useContext } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useChatApi from '../../Service/ChatApi';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

interface propsIF {
    selectedRoom: any;
    setRoom: any;
    isFullScreen: boolean;
    room: any;
    isCurrentPool: any;
    setIsCurrentPool: any;
    showCurrentPoolButton: any;
    setShowCurrentPoolButton: any;
    userCurrentPool: string;
    setUserCurrentPool: any;
    ensName: any;
    currentUser: any;
    favoritePoolsArray: PoolIF[];
    setFavoritePoolsArray: any;
}

export default function RoomDropdown(props: propsIF) {
    const {
        isFullScreen,
        isCurrentPool,
        setIsCurrentPool,
        showCurrentPoolButton,
        setShowCurrentPoolButton,
        favoritePoolsArray,
        setFavoritePoolsArray,
    } = props;
    const { topPools: rooms } = useContext(CrocEnvContext);
    const { favePools } = useContext(UserPreferenceContext);
    const currentPool = useAppSelector((state) => state.tradeData);

    // eslint-disable-next-line @typescript-eslint/ban-types
    const [roomArray] = useState<PoolIF[]>([]);
    const [isHovering, setIsHovering] = useState(false);
    const { updateUser } = useChatApi();

    // non-empty space
    const defaultRooms = [
        {
            id: 100,
            name: 'Global',
            value: 'Global',
        },
    ];

    const isFullScreenDefaultRooms = [
        {
            id: 100,
            name: 'Global',
            value: 'Global',
        },
    ];

    function findSpeed(pool: any) {
        switch (pool.base.symbol + '/' + pool.quote.symbol) {
            case 'ETH/USDC':
                return 0 as number;
            case 'ETH/WBTC':
                return 5;
            case 'USDC/DAI':
                return -2;
            case 'ETH/DAI':
                return -2;
            case 'USDC/WBTC':
                return -2;
            case 'WBTC/DAI':
                return -2;
            default:
                return 10;
        }
    }

    function findId(pool: any) {
        switch (pool.base.symbol + '/' + pool.quote.symbol) {
            case 'ETH/USDC':
                return 1;
            case 'ETH/WBTC':
                return 3;
            case 'USDC/DAI':
                return 4;
            case 'ETH/DAI':
                return 2;
            case 'USDC/WBTC':
                return 5;
            case 'WBTC/DAI':
                return 6;
            default:
                return 10;
        }
    }

    useEffect(() => {
        props.setUserCurrentPool(
            currentPool.baseToken.symbol +
                ' / ' +
                currentPool.quoteToken.symbol,
        );
        updateUser(
            props.currentUser as string,
            props.ensName,
            props.userCurrentPool,
        ).then((result: any) => {
            if (result.status === 'OK') {
                return true;
            }
        });

        if (props.selectedRoom === props.userCurrentPool) {
            setShowCurrentPoolButton(false);
        } else {
            setShowCurrentPoolButton(true);
        }
    }, [
        isCurrentPool,
        currentPool.baseToken.symbol,
        currentPool.quoteToken.symbol,
        props.selectedRoom,
        props.userCurrentPool,
    ]);

    useEffect(() => {
        rooms?.map((pool: PoolIF) => {
            if (!roomArray.some(({ name }) => name === pool.name)) {
                roomArray.push(pool);
            }
        });
        const fave:
            | PoolIF[]
            | {
                  name: string;
                  base: {
                      name: string;
                      address: string;
                      symbol: string;
                      decimals: number;
                      chainId: number;
                      logoURI: string;
                  };
                  quote: {
                      name: string;
                      address: string;
                      symbol: string;
                      decimals: number;
                      chainId: number;
                      logoURI: string;
                  };
                  chainId: string;
                  poolId: number;
                  speed: number;
                  id: number;
              }[] = [];
        favePools.pools.forEach((pool: PoolIF) => {
            const favPool = {
                name: pool.base.symbol + ' / ' + pool.quote.symbol,
                base: {
                    name: pool.base.name,
                    address: pool.base.address,
                    symbol: pool.base.symbol,
                    decimals: pool.base.decimals,
                    chainId: pool.base.chainId,
                    logoURI: pool.base.logoURI,
                },
                quote: {
                    name: pool.quote.name,
                    address: pool.quote.address,
                    symbol: pool.quote.symbol,
                    decimals: pool.quote.decimals,
                    chainId: pool.quote.chainId,
                    logoURI: pool.quote.logoURI,
                },
                chainId: pool.chainId,
                poolId: pool.poolId,
                speed: findSpeed(pool),
                id: findId(pool),
            };

            if (!roomArray.some(({ name }) => name === favPool.name)) {
                roomArray.push(favPool);
            }

            for (let x = 0; x < roomArray.length; x++) {
                if (favPool.name === roomArray[x].name) {
                    roomArray.push(roomArray.splice(x, 1)[0]);
                }
            }
            fave.push(favPool);
        });
        setFavoritePoolsArray(() => {
            return fave;
        });
        const middleIndex = Math.ceil(favoritePoolsArray.length / 2);
        favoritePoolsArray.splice(0, middleIndex);
        if (props.selectedRoom !== 'Global') {
            const index = roomArray
                .map((e) => e.name)
                .indexOf(props.selectedRoom);
            roomArray.splice(index, 1);

            const middleIndex = Math.ceil(favoritePoolsArray.length / 2);
            favoritePoolsArray.splice(0, middleIndex);
        }
    }, [favePools, props.selectedRoom]);

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
        props.setRoom(
            currentPool.baseToken.symbol +
                ' / ' +
                currentPool.quoteToken.symbol,
        );
        setShowCurrentPoolButton(false);
        setIsActive(false);
        setIsCurrentPool(true);
    }

    function handleShowRoomsExceptGlobal(selectedRoom: string) {
        if (isFullScreen) {
            if (selectedRoom === 'Global') {
                return (
                    <div
                        className={styles.dropdown_item}
                        key={defaultRooms[1].id}
                        data-value={defaultRooms[1].value}
                        onClick={(event: any) =>
                            handleRoomClick(event, 'Global')
                        }
                    ></div>
                );
            } else {
                {
                    return isFullScreenDefaultRooms.map((tab) => (
                        <div
                            className={styles.dropdown_item}
                            key={tab.id}
                            data-value={tab.value}
                            onClick={(event: any) =>
                                handleRoomClick(event, tab.name)
                            }
                        >
                            {tab.name}
                        </div>
                    ));
                }
            }
        } else {
            if (selectedRoom === 'Global') {
                if (roomArray.length !== 0) {
                    return '';
                }
            } else {
                const reverseRooms = [...defaultRooms].reverse();
                return reverseRooms.map((tab) => (
                    <div
                        className={styles.dropdown_item}
                        key={tab.id}
                        data-value={tab.value}
                        onClick={(event: any) =>
                            handleRoomClick(event, tab.name)
                        }
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
            <div
                className={
                    isActive
                        ? styles.dropdown_btn_isActive
                        : styles.dropdown_btn
                }
            >
                <div
                    onClick={() => handleDropdownMenu()}
                    style={{ flexGrow: '1' }}
                >
                    {props.selectedRoom}
                </div>
                {showCurrentPoolButton ? (
                    <div
                        className={styles.current_pool}
                        onClick={() => handleRoomClickCurrentPool()}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        <div
                            className={
                                isHovering
                                    ? styles.bgsalmon
                                    : styles.current_pool_text
                            }
                        >
                            Current Pool
                        </div>
                    </div>
                ) : (
                    ''
                )}
                <div onClick={() => handleDropdownMenu()}> </div>
                <div onClick={() => handleDropdownMenu()}>
                    <RiArrowDownSLine
                        className={styles.star_icon}
                        size={22}
                        id='room dropdown'
                    />
                </div>
            </div>
            {isActive && (
                <div className={styles.dropdow_content}>
                    <div className={styles.item}>
                        {roomArray.map((pool, i) => (
                            <div
                                className={styles.dropdown_item}
                                key={i}
                                data-value={pool.name}
                                data-icon='glyphicon glyphicon-eye-open'
                                onClick={(event: any) =>
                                    handleRoomClick(
                                        event,
                                        pool.quote.symbol +
                                            ' / ' +
                                            pool.base.symbol,
                                    )
                                }
                            >
                                {favoritePoolsArray.some(
                                    ({ name }) => name === pool.name,
                                ) ? (
                                    <svg
                                        width={smallScrenView ? '15px' : '20px'}
                                        height={
                                            smallScrenView ? '15px' : '20px'
                                        }
                                        viewBox='0 0 15 15'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <g clipPath='url(#clip0_1874_47746)'>
                                            <path
                                                d='M12.8308 3.34315C12.5303 3.04162 12.1732 2.80237 11.7801 2.63912C11.3869 2.47588 10.9654 2.39185 10.5397 2.39185C10.1141 2.39185 9.69255 2.47588 9.29941 2.63912C8.90626 2.80237 8.54921 3.04162 8.24873 3.34315L7.78753 3.81033L7.32633 3.34315C7.02584 3.04162 6.66879 2.80237 6.27565 2.63912C5.8825 2.47588 5.461 2.39185 5.03531 2.39185C4.60962 2.39185 4.18812 2.47588 3.79498 2.63912C3.40183 2.80237 3.04478 3.04162 2.7443 3.34315C1.47451 4.61294 1.39664 6.75721 2.99586 8.38637L7.78753 13.178L12.5792 8.38637C14.1784 6.75721 14.1005 4.61294 12.8308 3.34315Z'
                                                fill={'#6b6f7d'}
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
                                {pool.name}
                            </div>
                        ))}

                        {handleShowRoomsExceptGlobal(props.selectedRoom)}
                    </div>
                </div>
            )}
        </div>
    );
}
