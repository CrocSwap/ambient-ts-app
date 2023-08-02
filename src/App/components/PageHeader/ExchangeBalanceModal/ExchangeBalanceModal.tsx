import { useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import styles from './ExchangeBalanceModal.module.css';
import useKeyPress from '../../../hooks/useKeyPress';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

export const ExchangeBalanceModal = () => {
    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

    const escapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (fullLayoutActive && !isTokenModalOpen && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <NavItem
            icon={<img src={coins} />}
            open={fullLayoutActive}
            setOpen={setFullLayoutActive}
            allowClicksOutside={isTokenModalOpen}
            square={showMobileVersion}
        >
            <div className={styles.dropdown}>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    setIsTokenModalOpen={setIsTokenModalOpen}
                    isModalView
                />
            </div>
        </NavItem>
    );
};
