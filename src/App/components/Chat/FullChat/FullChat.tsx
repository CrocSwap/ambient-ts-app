import styles from './FullChat.module.css';
import { useState, Dispatch, SetStateAction } from 'react';
import { FiAtSign, FiSettings } from 'react-icons/fi';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from 'react-icons/tb';
import { MdOutlineChat } from 'react-icons/md';
import { AiOutlineSound } from 'react-icons/ai';
import { IoOptions, IoNotificationsOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { topPools } from '../../../../App/mockData';
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
    // eslint-disable-next-line
    currentPool: any;
}

interface ChannelDisplayPropsIF {
    pool: PoolIF;
}
export default function FullChat(props: FullChatPropsIF) {
    const { messageList, chatNotification, messageInput, userName, currentPool } = props;
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
    const [readableRoomName, setReadableName] = useState('Global');
    // eslint-disable-next-line
    function handleRoomClick(event: any, pool: PoolIF) {
        const roomName = pool.base.symbol + pool.quote.symbol;
        props.setRoom(roomName);

        const readableRoomName = `${pool.base.symbol} / ${pool.quote.symbol}`;
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

        // handleDropdownMenu();
    }

    function handleGlobalClick() {
        props.setRoom('Global');
        setReadableName('Global');
    }

    function handleCurrentPoolClick() {
        props.setRoom(currentPool.baseToken.symbol + currentPool.quoteToken.symbol);
        setReadableName(`${currentPool.baseToken.symbol} / ${currentPool.quoteToken.symbol}`);
    }

    function ChannelDisplay(props: ChannelDisplayPropsIF) {
        const { pool } = props;

        const activePoolStyle = pool?.name === readableRoomName ? styles.active_room : '';
        const poolIsCurrentPool =
            pool.name === `${currentPool.baseToken.symbol} / ${currentPool.quoteToken.symbol}`;
        const activePoolIsCurrentPool = poolIsCurrentPool && pool?.name === readableRoomName;

        return (
            <div
                className={`${styles.pool_display} ${activePoolStyle}`}
                // eslint-disable-next-line
                onClick={(event: any) => handleRoomClick(event, pool)}
            >
                <div>
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
                <TbLayoutSidebarLeftCollapse size={20} color='var(--text-highlight)' />
            ) : (
                <TbLayoutSidebarLeftExpand size={20} color='var(--text-highlight)' />
            )}{' '}
        </div>
    );

    const chatOptionData = [
        { title: 'Settings', icon: <FiSettings size={20} color='var(--text-highlight)' /> },
        {
            title: 'Notification',
            icon: <IoNotificationsOutline size={20} color='var(--text-highlight)' />,
        },
        { title: 'Sound', icon: <AiOutlineSound size={20} color='var(--text-highlight)' /> },
    ];

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

            <div className={styles.option_item} onClick={handleCurrentPoolClick}>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Current Pool</span>
            </div>
            <div
                className={styles.option_item}
                style={{ background: currentRoomIsGlobal ? 'var(--dark3)' : '' }}
                onClick={handleGlobalClick}
            >
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Global</span>
            </div>
            {topPools.map((pool, idx) => (
                <ChannelDisplay pool={pool} key={idx} />
            ))}
        </section>
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
        <div className={isChatSidebarOpen ? styles.main_container : styles.main_container_close}>
            <section className={styles.left_container}>
                <header className={styles.user_wallet}>
                    <Link to='/account'>{userName}</Link>
                    {sidebarExpandOrCollapseIcon}
                </header>
                {chatOptions}
                {chatChanels}
            </section>

            <section className={styles.right_container}>
                <header className={styles.right_container_header}># {readableRoomName}</header>
                {chatContainer}
            </section>
        </div>
    );
}
