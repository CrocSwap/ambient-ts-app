import styles from './SwitchNetwork.module.css';
import { RiErrorWarningLine } from 'react-icons/ri';
import { useEffect } from 'react';
import NetworkButtons from '../NetworkButton/NetworkButtons';

interface SwitchNetworkProps {
    // showSwitchNetwork: boolean;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
    onClose: () => void;
}

export default function SwitchNetwork(props: SwitchNetworkProps) {
    const { onClose, chainId, setFallbackChainId } = props;

    // THIS ALLOWS THE USER TO CLOSE MODAL BY HITTING THE ESCAPE KEY
    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) onClose();
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });

    const modal = (
        <>
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
                            setFallbackChainId={setFallbackChainId}
                            onClose={onClose}
                        />
                        {/* <NetworkButton /> */}
                    </section>
                </div>
                {/* <div className={styles.greeting}></div> */}
            </div>
        </>
    );

    return <>{modal}</>;
}
