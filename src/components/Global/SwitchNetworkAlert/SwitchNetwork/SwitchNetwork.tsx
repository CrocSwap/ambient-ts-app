// START: Import React and Dongles
import { RiErrorWarningLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './SwitchNetwork.module.css';
import NetworkButtons from '../NetworkButton/NetworkButtons';

// interface SwitchNetworkPropsIF {
//     switchNetwork: (providedChainId: string) => Promise<void>;
// }

export default function SwitchNetwork() {
    return (
        <div className={styles.outside_modal}>
            <div className={styles.modal_container}>
                <div className={styles.modal}>
                    <header className={styles.modal_header}>
                        <RiErrorWarningLine
                            size={24}
                            color='var(--text-grey-white)'
                        />
                        <h2>Unsupported Network</h2>
                    </header>
                    <section className={styles.modal_content}>
                        <span className={styles.content_title}>
                            Please choose a network below
                        </span>
                        <NetworkButtons />
                    </section>
                </div>
            </div>
        </div>
    );
}
