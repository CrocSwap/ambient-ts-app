import styles from './FullChat.module.css';
import { useState } from 'react';
import { FiAtSign } from 'react-icons/fi';
export default function FullChat() {
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(true);
    const chatOptions = (
        <section className={styles.options}>
            <header>OPTIONS</header>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Settings</span>
            </div>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Notification</span>
            </div>
            <div>
                <FiAtSign size={20} color='var(--text-highlight)' />
                <span> Sound</span>
            </div>
        </section>
    );
    const chatChanels = (
        <section className={styles.options}>
            <header>CHANNELS</header>
            <div>
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
            </div>
        </section>
    );

    return (
        <div className={isChatSidebarOpen ? styles.main_container : styles.main_container_close}>
            <section className={styles.left_container}>
                <header className={styles.user_wallet}>JrJunior.eth</header>
                {chatOptions}
                {chatChanels}
            </section>

            <section className={styles.right_container}>
                <header className={styles.right_container_header}>#Global</header>
            </section>
        </div>
    );
}
