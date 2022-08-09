// START: Import React and Dongles
import { Dispatch, SetStateAction, useEffect } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

// START: Import Local Files
import styles from './SwitchNetwork.module.css';
import NetworkButtons from '../NetworkButton/NetworkButtons';

interface SwitchNetworkPropsIF {
    chainId: string;
    switchChain: Dispatch<SetStateAction<string>>;
    onClose: () => void;
}

export default function SwitchNetwork(props: SwitchNetworkPropsIF) {
    const { onClose, chainId, switchChain } = props;

    function closeOnEscapeKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') onClose();
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });

    return (
        <div className={styles.outside_modal}>
            <div className={styles.modal}>
                <header className={styles.modal_header}>
                    <RiErrorWarningLine size={20} color='#ffffff' />
                    <h2>Unsupported Network</h2>
                </header>
                <section className={`${styles.modal_content} `}>
                    <span className={styles.content_title}>Please choose a network below</span>
                    <NetworkButtons
                        chainId={chainId}
                        onClose={onClose}
                        switchChain={switchChain}
                    />
                </section>
            </div>
        </div>
    );
}
