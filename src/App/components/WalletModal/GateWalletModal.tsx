// START: Import React and Dongles
import { useContext, useEffect, useState } from 'react';

// START: Import Local Files
import styles from './GateWalletModal.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Form/Button';

import { useTermsAgreed } from '../../hooks/useTermsAgreed';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { useWeb3Modal } from '@web3modal/ethers5/react';

export default function GateWalletModal() {
    const {
        walletModal: { isOpen: isModalOpen, close: closeModal },
    } = useContext(AppStateContext);

    const defaultState = import.meta.env.VITE_VIEW_ONLY
        ? 'notAvailable'
        : 'wallets';

    const [_, setPage] = useState(defaultState);

    // reset the page everytime the modal is closed
    useEffect(() => {
        if (!isModalOpen) {
            setPage(defaultState);
        }
    }, [isModalOpen]);

    const [recordAgreed, __, termUrls] = useTermsAgreed();
    const { open: openW3Modal } = useWeb3Modal();

    return (
        <Modal onClose={closeModal} title='Welcome'>
            <div className={styles.main_container}>
                <section className={styles.first_section}>
                    <p>
                        This website is a public{' '}
                        <a
                            href={termUrls.openSource}
                            target='_blank'
                            rel='noreferrer'
                            aria-label='open source repo'
                        >
                            open source web application
                        </a>{' '}
                        to access the blockchain-based Ambient protocol.
                    </p>
                    <p>
                        By clicking Agree, you accept the{' '}
                        <a
                            href={`${window.location.origin}/${termUrls.tos}`}
                            target='_blank'
                            rel='noreferrer'
                            aria-label='terms of service'
                        >
                            Terms of Service
                        </a>
                        .
                    </p>
                    <p>
                        Site Privacy Policy can be{' '}
                        <a
                            href={`${window.location.origin}/${termUrls.privacy}`}
                            target='_blank'
                            rel='noreferrer'
                            aria-label='site policy'
                        >
                            found here
                        </a>
                        .
                    </p>
                </section>
                <section>
                    <Button
                        idForDOM='agree_button_ToS'
                        flat
                        title='Agree'
                        action={() => {
                            recordAgreed();
                            closeModal();
                            openW3Modal();
                        }}
                    />
                </section>
            </div>
        </Modal>
    );
}
