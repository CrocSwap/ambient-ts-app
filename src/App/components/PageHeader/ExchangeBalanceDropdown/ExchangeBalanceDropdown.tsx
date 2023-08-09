import { useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import styles from './ExchangeBalanceDropdown.module.css';
import useKeyPress from '../../../hooks/useKeyPress';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

export const ExchangeBalanceDropdown = () => {
    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const [tokenModalOpen, setTokenModalOpen] = useState(false);

    const escapePressed = useKeyPress('Escape');

    useEffect(() => {
        if (fullLayoutActive && !tokenModalOpen && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);

    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <NavItem
            icon={<img src={coins} />}
            open={fullLayoutActive}
            setOpen={setFullLayoutActive}
            allowClicksOutside={tokenModalOpen}
            square={showMobileVersion}
        >
            <div className={styles.dropdown}>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    setTokenModalOpen={setTokenModalOpen}
                    isModalView
                />
            </div>
        </NavItem>
    );
};
