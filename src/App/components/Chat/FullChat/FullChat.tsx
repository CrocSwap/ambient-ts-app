import styles from './FullChat.module.css';
import { useState } from 'react';
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
    room: any;
    userName: string;
}

interface ChannelDisplayPropsIF {
    pool: PoolIF;
}
export default function FullChat(props: FullChatPropsIF) {
    const { messageList, chatNotification, messageInput, room, userName } = props;
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);

    console.log(topPools);

    function ChannelDisplay(props: ChannelDisplayPropsIF) {
        const { pool } = props;

        return (
            <div className={styles.pool_display}>
                <div>
                    <img src={pool?.base.logoURI} alt='base token' />
                    <img src={pool?.quote.logoURI} alt='quote token' />
                </div>
                <span>{pool?.name}</span>
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
    const chatChanels = (
        <section className={styles.options}>
            <header>
                <h3>CHANNELS</h3>
                <MdOutlineChat size={20} color='var(--text-grey-light)' />
            </header>
            {/* <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span># Global</span>
            </div>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span># Something1</span>
            </div>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span># Something2</span>
            </div>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span># Something3</span>
            </div> */}
            <div className={styles.option_item}>
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
            {/* <div className={styles.chat_scrollable}> */}
            {messageList}
            {chatNotification}

            {/* </div> */}
            {/* <div className={styles.chat_input}>
                I am chat input
            </div> */}
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
                <header className={styles.right_container_header}># {room}</header>
                {chatContainer}
            </section>
        </div>
    );
}
