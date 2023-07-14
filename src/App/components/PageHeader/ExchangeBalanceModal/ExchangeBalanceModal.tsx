import { useContext, useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import styles from './ExchangeBalanceModal.module.css';
import useKeyPress from '../../../hooks/useKeyPress';
import { AppStateContext } from '../../../../contexts/AppStateContext';

export const ExchangeBalanceModal = () => {
    const {
        globalModal: { isOpen: isModalOpen },
    } = useContext(AppStateContext);
    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);

    const escapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (fullLayoutActive && !isModalOpen && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);

    return (
        <NavItem
            icon={<img src={coins} />}
            open={fullLayoutActive}
            setOpen={setFullLayoutActive}
            allowClicksOutside={isModalOpen}
        >
            <div className={styles.dropdown}>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    isModalView
                />
            </div>
        </NavItem>
    );
};
