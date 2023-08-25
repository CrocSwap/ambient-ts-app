import { useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import coins from '../../../../assets/images/coins.svg';
import NavItem from '../NavItem/NavItem';
import useKeyPress from '../../../hooks/useKeyPress';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { StyledExchangeBalanceDropdown } from '../../../../styled/Components/Header';

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
            <StyledExchangeBalanceDropdown>
                <ExchangeBalance
                    fullLayoutActive={fullLayoutActive}
                    setFullLayoutActive={setFullLayoutActive}
                    setTokenModalOpen={setTokenModalOpen}
                    isModalView
                />
            </StyledExchangeBalanceDropdown>
        </NavItem>
    );
};
