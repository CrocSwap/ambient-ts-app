import { useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import useKeyPress from '../../../hooks/useKeyPress';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './ExchangeBalanceDropdown.module.css';
import Modal from '../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../components/Global/ModalHeader/ModalHeader';
export const ExchangeBalanceDropdown = () => {
    const isDevMenuEnabled = false;
    // import.meta.env.VITE_IS_DEV_MENU_ENABLED !== undefined
    //     ? import.meta.env.VITE_IS_DEV_MENU_ENABLED === 'true'
    //     : true;

    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    const escapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (fullLayoutActive && !tokenModalOpen && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const modalVersion = (
        <Modal usingCustomHeader onClose={() => setFullLayoutActive(false)}>
            <ModalHeader
                title={'Exchange Balance'}
                onClose={() => setFullLayoutActive(false)}
            />
            <div className={styles.container}>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    setTokenModalOpen={setTokenModalOpen}
                    isModalView
                />
            </div>
        </Modal>
    );

    if (isDevMenuEnabled)
        return (
            <ExchangeBalance
                fullLayoutActive={fullLayoutActive}
                setFullLayoutActive={setFullLayoutActive}
                setTokenModalOpen={setTokenModalOpen}
                isModalView
            />
        );

    return (
        <NavItem
            icon={<img src={coins} />}
            open={fullLayoutActive}
            setOpen={setFullLayoutActive}
            allowClicksOutside={showMobileVersion}
            square={showMobileVersion}
            blurBg={false}
        >
            {showMobileVersion ? (
                modalVersion
            ) : (
                <div className={styles.container}>
                    <ExchangeBalance
                        fullLayoutActive={fullLayoutActive}
                        setFullLayoutActive={setFullLayoutActive}
                        setTokenModalOpen={setTokenModalOpen}
                        isModalView
                    />
                </div>
            )}
        </NavItem>
    );
};
