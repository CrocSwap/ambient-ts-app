import { useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import styles from './ExchangeBalanceModal.module.css';
import useKeyPress from '../../../hooks/useKeyPress';

export const ExchangeBalanceModal = () => {
    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    // const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

    const escapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (fullLayoutActive && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);

    return (
        <NavItem
            icon={<img src={coins} />}
            open={fullLayoutActive}
            setOpen={setFullLayoutActive}
            // allowClicksOutside={isTokenModalOpen}
        >
            <div className={styles.dropdown}>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    // setIsTokenModalOpen={setIsTokenModalOpen}
                    isModalView
                />
            </div>
        </NavItem>
    );
};
