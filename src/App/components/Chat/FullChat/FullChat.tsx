import styles from './FullChat.module.css';
import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { FiAtSign, FiSettings } from 'react-icons/fi';
import {
    TbLayoutSidebarLeftCollapse,
    TbLayoutSidebarLeftExpand,
} from 'react-icons/tb';
import { MdOutlineChat } from 'react-icons/md';
import { AiOutlineSound } from 'react-icons/ai';
import { IoOptions, IoNotificationsOutline } from 'react-icons/io5';
import { Link, useParams } from 'react-router-dom';
import { topPools } from '../../../../App/mockData';
import { favePoolsMethodsIF } from '../../../../App/hooks/useFavePools';
import { PoolIF } from '../../../../utils/interfaces/exports';

interface FullChatPropsIF {
    messageList: JSX.Element;
    chatNotification: JSX.Element;
    messageInput: JSX.Element;
    room: string;

    setRoom: Dispatch<SetStateAction<string>>;
    setIsCurrentPool: Dispatch<SetStateAction<boolean>>;

    userName: string;
    showCurrentPoolButton: boolean;
    setShowCurrentPoolButton: Dispatch<SetStateAction<boolean>>;
    favePools: favePoolsMethodsIF;
    userCurrentPool: string;
}

interface ChannelDisplayPropsIF {
    pool: PoolIF;
    isDropdown: boolean;
}
export default function FullChat(props: FullChatPropsIF) {
    const { params } = useParams();
    const reconstructedReadableRoom = params
        ? params.replace('&', '/').toUpperCase()
        : undefined;

    // eslint-disable-next-line
    const currentPoolChannel = new BroadcastChannel('currentPoolChannel');
    const {
        messageList,
        chatNotification,
        messageInput,
        userName,
        userCurrentPool,
    } = props;
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);

    const [readableRoomName, setReadableName] = useState(
        reconstructedReadableRoom || 'global',
    );
    const [showChannelsDropdown, setShowChannelsDropdown] = useState(false);

    useEffect(() => {
        if (reconstructedReadableRoom) {
            setReadableName(reconstructedReadableRoom);
            props.setRoom(reconstructedReadableRoom);
        }
    }, [reconstructedReadableRoom]);

    // eslint-disable-next-line
    function handleRoomClick(event: any, pool: PoolIF, isDropdown: boolean) {
        const roomName = pool.base.symbol + '/' + pool.quote.symbol;
        props.setRoom(roomName);

        const readableRoomName = `${pool.base.symbol}/${pool.quote.symbol}`;
        setReadableName(readableRoomName);

        if (roomName.toString() === 'Current Pool') {
            props.setIsCurrentPool(true);
            if (props.showCurrentPoolButton) {
                props.setShowCurrentPoolButton(false);
            }
        } else {
            props.setIsCurrentPool(false);
            props.setShowCurrentPoolButton(true);
        }

        if (isDropdown) setShowChannelsDropdown(!showChannelsDropdown);

        // handleDropdownMenu();
    }

    // eslint-disable-next-line
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

    // eslint-disable-next-line
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
        props.favePools.pools.map((pool: PoolIF) => {
            const favPool = {
                name: pool.base.symbol + '/' + pool.quote.symbol,
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

            if (!topPools.some(({ name }) => name === favPool.name)) {
                topPools.push(favPool);
            }

            for (let x = 0; x < topPools.length; x++) {
                if (favPool.name === topPools[x].name) {
                    topPools.push(topPools.splice(x, 1)[0]);
                } else {
                    // do nothing
                }
            }
        });
    }, []);

    function handleGlobalClick() {
        props.setRoom('Global');
        setReadableName('Global');
    }

    function handleCurrentPoolClick() {
        props.setRoom(userCurrentPool);
        setReadableName(userCurrentPool);
    }

    function ChannelDisplay(props: ChannelDisplayPropsIF) {
        const { pool, isDropdown } = props;

        const activePoolStyle =
            pool?.name === readableRoomName ? styles.active_room : '';
        const poolIsCurrentPool = pool.name === userCurrentPool;
        const activePoolIsCurrentPool =
            poolIsCurrentPool && pool?.name === readableRoomName;

        return (
            <div
                className={`${styles.pool_display} ${activePoolStyle}`}
                // eslint-disable-next-line
                onClick={(event: any) => {
                    // console.log({ pool });
                    handleRoomClick(event, pool, isDropdown);
                }}
            >
                <div className={styles.token_logos}>
                    <img src={pool?.base.logoURI} alt='base token' />
                    <img src={pool?.quote.logoURI} alt='quote token' />
                </div>
                <span>{pool?.name}</span>
                {poolIsCurrentPool && (
                    <p
                        className={styles.current_pool}
                        style={{
                            color: activePoolIsCurrentPool
                                ? 'var(--text-grey-white)'
                                : 'var(--text-grey-dark)',
                        }}
                    >
                        Current Pool
                    </p>
                )}
            </div>
        );
    }

    const sidebarExpandOrCollapseIcon = (
        <div onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}>
            {isChatSidebarOpen ? (
                <TbLayoutSidebarLeftCollapse
                    size={20}
                    color='var(--text-highlight)'
                />
            ) : (
                <TbLayoutSidebarLeftExpand
                    size={20}
                    color='var(--text-highlight)'
                />
            )}{' '}
        </div>
    );

    const chatOptionData = [
        {
            title: 'Settings',
            icon: <FiSettings size={20} color='var(--text-highlight)' />,
        },
        {
            title: 'Notification',
            icon: (
                <IoNotificationsOutline
                    size={20}
                    color='var(--text-highlight)'
                />
            ),
        },
        {
            title: 'Sound',
            icon: <AiOutlineSound size={20} color='var(--text-highlight)' />,
        },
    ];
    // eslint-disable-next-line
    const chatOptions = (
        <section className={styles.options}>
            <header>
                <h3>OPTIONS</h3>

                <IoOptions size={20} color='var(--text-grey-light)' />
            </header>
            {chatOptionData.map((item, idx) => (
                <div key={idx} className={styles.option_item}>
                    {item.icon}
                    <span>{item.title}</span>
                </div>
            ))}
        </section>
    );

    const currentRoomIsGlobal = readableRoomName === 'Global';

    const chatChanels = (
        <section className={styles.options}>
            <header>
                <h3>CHANNELS</h3>
                <MdOutlineChat size={20} color='var(--text-grey-light)' />
            </header>

            <div
                className={styles.option_item}
                onClick={handleCurrentPoolClick}
            >
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Current Pool</span>
            </div>
            <div
                className={styles.option_item}
                style={{
                    background: currentRoomIsGlobal ? 'var(--dark3)' : '',
                }}
                onClick={handleGlobalClick}
            >
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Global</span>
            </div>
            {topPools.map((pool, idx) => (
                <ChannelDisplay pool={pool} key={idx} isDropdown={false} />
            ))}
        </section>
    );

    const channelsDropdown = (
        <div className={styles.channels_dropdown}>
            <button
                className={styles.active_channel_dropdown}
                onClick={() => setShowChannelsDropdown(!showChannelsDropdown)}
            >
                # {readableRoomName}
            </button>
            {showChannelsDropdown && (
                <div
                    className={
                        showChannelsDropdown
                            ? styles.active_channel_dropdown_items_containers
                            : styles.channel_dropdown_items_containers
                    }
                >
                    {topPools.map((pool, idx) => (
                        <ChannelDisplay
                            pool={pool}
                            key={idx}
                            isDropdown={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const chatContainer = (
        <div className={styles.chat_main_container}>
            {messageList}
            {chatNotification}

            {messageInput}
            <div id='thelastmessage' />
        </div>
    );

    return (
        <div
            className={
                isChatSidebarOpen
                    ? styles.main_container
                    : styles.main_container_close
            }
        >
            <section className={styles.left_container}>
                <header className={styles.user_wallet}>
                    <Link to='/account'>{userName}</Link>
                    {sidebarExpandOrCollapseIcon}
                </header>
                {/* {chatOptions} */}
                {chatChanels}
            </section>

            <section className={styles.right_container}>
                <header className={styles.right_container_header}>
                    # {readableRoomName}
                </header>{' '}
                {channelsDropdown}
                {chatContainer}
            </section>
        </div>
    );
}
