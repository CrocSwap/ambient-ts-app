import { useContext, useEffect, useState } from 'react';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import NavItem from '../NavItem/NavItem';
import useKeyPress from '../../../hooks/useKeyPress';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { StyledExchangeBalanceDropdown } from '../../../../styled/Components/Header';
import { BsCurrencyExchange } from 'react-icons/bs';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';

export const ExchangeBalanceDropdown = () => {
    const [fullLayoutActive, setFullLayoutActive] = useState<boolean>(false);
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    const escapePressed = useKeyPress('Escape');
    const { isActiveNetworkPlume } = useContext(ChainDataContext);

    useEffect(() => {
        if (fullLayoutActive && !tokenModalOpen && escapePressed) {
            setFullLayoutActive(false);
        }
    }, [escapePressed]);

    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    return (
        <NavItem
            icon={
                <BsCurrencyExchange
                    size={16}
                    color={
                        isActiveNetworkPlume ? 'var(--text2)' : 'var(--accent5)'
                    }
                />
            }
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
