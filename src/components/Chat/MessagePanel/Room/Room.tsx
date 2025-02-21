/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';
import {
    getDefaultPairForChain,
    ZERO_ADDRESS,
} from '../../../../ambient-utils/constants';
import { PoolIF, TokenIF } from '../../../../ambient-utils/types';
import { AppStateContext } from '../../../../contexts';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../contexts/TokenContext';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { UserPreferenceContext } from '../../../../contexts/UserPreferenceContext';
import Toggle from '../../../Form/Toggle';
import { ALLOW_MENTIONS } from '../../ChatConstants/ChatConstants';
import {
    ChatGoToChatParamsIF,
    ChatRoomIF,
    GetTopRoomsResponseIF,
} from '../../ChatIFs';
import {
    createRoomIF,
    getDefaultRooms,
    getRoomNameFromBaseQuote,
    getRoomNameFromPool,
    getRoomObjFromBaseQuote,
    defaultRoom,
} from '../../ChatUtils';
import useChatApi from '../../Service/ChatApi';
import styles from './Room.module.css';

interface propsIF {
    selectedRoom: string;
    setRoom: Dispatch<SetStateAction<string>>;
    room: string;
    isCurrentPool: boolean;
    setIsCurrentPool: Dispatch<SetStateAction<boolean>>;
    showCurrentPoolButton: boolean;
    setShowCurrentPoolButton: Dispatch<SetStateAction<boolean>>;
    userCurrentPool: string;
    setUserCurrentPool: any;
    ensName: string;
    currentUser: any;
    isFocusMentions: boolean;
    setIsFocusMentions: any;
    notifications?: Map<string, number>;
    mentCount: number;
    mentionIndex: number;
    isModerator: boolean;
    setGoToChartParams?: Dispatch<
        SetStateAction<ChatGoToChatParamsIF | undefined>
    >;
    isChatOpen: boolean;
}

export default function Room(props: propsIF) {
    const {
        isCurrentPool,
        setIsCurrentPool,
        showCurrentPoolButton,
        setShowCurrentPoolButton,
    } = props;
    const rooms: PoolIF[] = [];
    const { favePools } = useContext(UserPreferenceContext);
    const { baseToken, quoteToken, tokenA, tokenB } =
        useContext(TradeDataContext);

    // eslint-disable-next-line @typescript-eslint/ban-types
    const [isHovering, setIsHovering] = useState(false);
    const { updateUser } = useChatApi();
    const { getTopRooms } = useChatApi();

    const defaultChatRooms = getDefaultRooms(props.isModerator);
    const [roomList, setRoomList] = useState<ChatRoomIF[]>(defaultChatRooms);

    const assignUserCurrentPool = () => {
        const currentPool = baseToken.symbol + ' / ' + quoteToken.symbol;

        props.setUserCurrentPool(currentPool);
        updateUser(
            props.currentUser as string,
            props.ensName,
            props.userCurrentPool,
        );

        if (props.selectedRoom === currentPool) {
            setShowCurrentPoolButton(false);
        } else {
            setShowCurrentPoolButton(true);
        }
    };

    const { topPools } = useContext(CrocEnvContext);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { tokens } = useContext(TokenContext);

    const processRoomList = async () => {
        if (!props.isChatOpen) return;
        const defaultRooms = getDefaultRooms(props.isModerator);
        const newRoomList = [...defaultRooms];
        let topRooms: GetTopRoomsResponseIF[] = await getTopRooms();

        if (topRooms && topRooms.length > 0) {
            topRooms = topRooms
                .sort((a, b) => b.data.messageCount24h - a.data.messageCount24h)
                .slice(0, 3);

            // process top rooms
            topRooms.map((room, index) => {
                let found = false;
                if (!props.isModerator && room.roomInfo === 'Admins') return;

                const popularityScore = topRooms.length - index;
                newRoomList.map((pool) => {
                    if (pool.name === room.roomInfo) {
                        found = true;
                    }
                });
                if (!found) {
                    newRoomList.push(createRoomIF(room, popularityScore));
                }
            });
        }

        // assign current pool
        assignUserCurrentPool();

        // process fav pools
        favePools.pools.map((pool) => {
            let found = false;
            newRoomList.map((room) => {
                if (room.name === getRoomNameFromPool(pool)) {
                    found = true;
                }
            });
            if (!found) {
                newRoomList.push({
                    name: getRoomNameFromPool(pool),
                    shownName: getRoomNameFromPool(pool) + ' ❤️',
                    base: pool.baseToken.symbol,
                    quote: pool.quoteToken.symbol,
                    isFavourite: true,
                });
            }
        });

        if (
            !isCurrentPool &&
            !newRoomList.some(
                (e) =>
                    e.name ==
                    getRoomNameFromBaseQuote(
                        baseToken.symbol,
                        quoteToken.symbol,
                    ),
            )
        ) {
            const currentPoolRoomObj = getRoomObjFromBaseQuote(
                baseToken.symbol,
                quoteToken.symbol,
            );
            newRoomList.push(currentPoolRoomObj);
        }

        // add extra rooms from top pools list if needed
        let i = 0;
        while (
            newRoomList.length < 3 &&
            topPools.length > 0 &&
            i < topPools.length
        ) {
            const pool = topPools[i];
            if (!newRoomList.some((e) => e.name == getRoomNameFromPool(pool))) {
                newRoomList.push({
                    name: getRoomNameFromPool(pool),
                    shownName: getRoomNameFromPool(pool),
                    base: pool.baseToken.symbol,
                    quote: pool.quoteToken.symbol,
                });
            }
            i++;
        }

        if (newRoomList.length === 1) {
            newRoomList.push(defaultRoom);
        }

        setRoomList(newRoomList);
    };

    useEffect(() => {
        processRoomList();
        handlePoolRedirect(props.room);
    }, [
        isCurrentPool,
        baseToken.symbol,
        quoteToken.symbol,
        props.selectedRoom,
        props.userCurrentPool,
    ]);

    useEffect(() => {
        processRoomList();
    }, []);

    useEffect(() => {
        processRoomList();
    }, [
        props.isChatOpen,
        props.isModerator,
        favePools,
        props.selectedRoom,
        rooms.length === 0,
        props.currentUser,
    ]);

    const getRoomName = () => {
        let ret = props.selectedRoom;
        roomList.map((room) => {
            if (room.name === props.selectedRoom) {
                ret = room.shownName || room.name;
            }
        });

        return ret;
    };

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

    const [dfltTokenA]: [TokenIF, TokenIF] = getDefaultPairForChain(chainId);

    const handlePoolRedirect = async (roomName: string) => {
        const room = roomList.find((room) => room.name === roomName);

        if (room && room.base && room.quote) {
            const foundBase =
                room.base === 'ETH'
                    ? [tokens.getTokenByAddress(ZERO_ADDRESS) || dfltTokenA]
                    : tokens.getTokensByNameOrSymbol(room.base, chainId, true);
            const foundQuote = tokens.getTokensByNameOrSymbol(
                room.quote,
                chainId,
                true,
            );

            if (foundBase.length > 0 && foundQuote.length > 0) {
                const base = foundBase[0];
                const quote = foundQuote[0];

                const [targetA, targetB] =
                    tokenA.address.toLowerCase() === base.address.toLowerCase()
                        ? [base.address, quote.address]
                        : tokenA.address.toLowerCase() ===
                            quote.address.toLowerCase()
                          ? [quote.address, base.address]
                          : tokenB.address.toLowerCase() ===
                              base.address.toLowerCase()
                            ? [quote.address, base.address]
                            : [base.address, quote.address];

                if (props.setGoToChartParams) {
                    if (
                        base.symbol != baseToken.symbol ||
                        quote.symbol != quoteToken.symbol
                    ) {
                        props.setGoToChartParams({
                            chain: chainId,
                            tokenA: targetA,
                            tokenB: targetB,
                        });
                    } // same base quote, dont show go to room btn
                    else {
                        props.setGoToChartParams(undefined);
                    }
                }
            }
        } else {
            if (props.setGoToChartParams) {
                props.setGoToChartParams(undefined);
            }
        }
    };

    function handleRoomClick(event: any, name: string, poolName?: string) {
        props.setRoom(event.target.dataset.value || poolName);
        handlePoolRedirect(name);

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
        props.setRoom(baseToken.symbol + ' / ' + quoteToken.symbol);
        setShowCurrentPoolButton(false);
        setIsActive(false);
        setIsCurrentPool(true);
        setIsHovering(false);
    }

    function handleNotiDot(key: string) {
        if (props.notifications?.get(key)) {
            return <div className={styles.noti_dot}></div>;
        }
    }

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
                    className={styles.room_name_wrapper}
                    onClick={() => handleDropdownMenu()}
                    style={{ flexGrow: '1' }}
                >
                    {/* {props.selectedRoom} */}
                    {/* {props.selectedRoom} */}
                    {getRoomName()}
                    {handleNotiDot(props.selectedRoom || '')}
                    <RiArrowDownSLine
                        className={styles.dd_icon + ' ' + styles.m_visible}
                        size={22}
                    />
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
                            Go to Current Pool
                        </div>
                    </div>
                ) : (
                    ''
                )}
                <div onClick={() => handleDropdownMenu()}> </div>
                <div onClick={() => handleDropdownMenu()}>
                    <RiArrowDownSLine
                        className={styles.star_icon + ' ' + styles.m_hidden}
                        size={22}
                        id='room dropdown'
                    />
                </div>
            </div>
            {isActive && (
                <div className={styles.dropdown_content}>
                    <div className={styles.item}>
                        {roomList
                            .filter((e) => e.name !== props.selectedRoom)
                            .map((pool, i) => (
                                <div
                                    className={styles.dropdown_item}
                                    key={i}
                                    data-value={pool.name}
                                    // data-icon='glyphicon glyphicon-eye-open'
                                    onClick={(event: any) =>
                                        handleRoomClick(event, pool.name)
                                    }
                                >
                                    {/* {pool.isFavourite ? (
                                        <svg
                                            width={
                                                smallScrenView ? '15px' : '20px'
                                            }
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
                                    )} */}
                                    {pool.shownName
                                        ? pool.shownName
                                        : pool.name}
                                    {handleNotiDot(pool.name || '')}
                                </div>
                            ))}
                        {/* {handleShowRoomsExceptGlobal(props.selectedRoom)} */}
                    </div>

                    {/* // CHAT_FEATURES_WBO -  Feature : Mentions */}
                    {props.mentCount > 0 && ALLOW_MENTIONS && (
                        <div className={styles.only_mentions_wrapper}>
                            <span
                                className={`${styles.only_mentions_text} ${
                                    props.isFocusMentions
                                        ? styles.only_mentions_text_active
                                        : ''
                                }`}
                            >
                                Focus Mentions{' '}
                            </span>
                            <span
                                className={styles.only_mentions_toggle_wrapper}
                            >
                                <Toggle
                                    isOn={props.isFocusMentions}
                                    handleToggle={() => {
                                        props.setIsFocusMentions(
                                            !props.isFocusMentions,
                                        );
                                    }}
                                    Width={36}
                                    id='tg_set_focus_mentions'
                                ></Toggle>
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
