import { useContext, useState } from 'react';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import Separator from '../../../components/Futa/Separator/Separator';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import {
    TradeDropdown,
    TradeDropdownButton,
} from '../../../styled/Components/Trade';
import { BsCaretDownFill } from 'react-icons/bs';
import { ChartContext } from '../../../contexts/ChartContext';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');
    const smallScreen = useMediaQuery('(max-width: 500px)');

    const { activeMobileComponent, setActiveMobileComponent } =
        useContext(TradeTableContext);

    const [showMobileDropdown, setMobileDropdown] = useState(false);

    const handleMobileDropdownClick = (component: string) => {
        setActiveMobileComponent(component);
        setMobileDropdown(false);
    };

    const { isCandleDataNull } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const mobileTradeDropdown = (
        <TradeDropdown>
            <TradeDropdownButton
                onClick={() => setMobileDropdown(!showMobileDropdown)}
                activeText
            >
                {activeMobileComponent}

                <BsCaretDownFill />
            </TradeDropdownButton>

            {showMobileDropdown && (
                <div
                    style={{
                        position: 'absolute',
                        marginTop: '8px',
                        width: '100%',
                        background: 'var(--dark2)',
                    }}
                >
                    {activeMobileComponent !== 'trade' && (
                        <TradeDropdownButton
                            onClick={() => handleMobileDropdownClick('trade')}
                        >
                            Trade
                        </TradeDropdownButton>
                    )}

                    {!isCandleDataNull &&
                        isPoolInitialized &&
                        activeMobileComponent !== 'chart' && (
                            <TradeDropdownButton
                                onClick={() =>
                                    handleMobileDropdownClick('chart')
                                }
                            >
                                Chart
                            </TradeDropdownButton>
                        )}
                </div>
            )}
        </TradeDropdown>
    );

    const mobileSwap = (
        <section className={styles.mobileMainSection}>
            {mobileTradeDropdown}

            {activeMobileComponent === 'chart' && (
                <div className={styles.chartSection}>
                    <Divider count={2} />
                    <Trade />
                </div>
            )}

            {activeMobileComponent === 'trade' && (
                <ContentContainer noPadding noStyle={smallScreen}>
                    <div>
                        <Divider count={2} />
                        <Swap isOnTradeRoute />
                    </div>
                </ContentContainer>
            )}
        </section>
    );

    if (showActiveMobileComponent) return mobileSwap;

    return (
        <section className={styles.mainSection}>
            <div className={styles.chartSection}>
                <Divider count={2} />
                <Trade />
            </div>

            <div style={{ paddingBottom: '4px' }}>
                <Separator dots={100} />
            </div>

            <div>
                <Divider count={2} />
                <Swap isOnTradeRoute />
            </div>
        </section>
    );
}

export default SwapFuta;
