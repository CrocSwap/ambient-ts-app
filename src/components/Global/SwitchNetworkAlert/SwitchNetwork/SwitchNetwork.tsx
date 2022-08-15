// START: Import React and Dongles
import { Dispatch, SetStateAction } from 'react';
import { useChain } from 'react-moralis';
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
    const { chainId, switchChain, onClose } = props;

    const { switchNetwork } = useChain();

    function selectChain(newChain:string) {
        // GOAL ONE: switch Moralis to a valid chain
        switchNetwork(newChain);
        // GOAL TWO: toggle modal display boolean to false
        onClose();
    }

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
                        selectChain={selectChain}
                    />
                </section>
            </div>
        </div>
    );
}
