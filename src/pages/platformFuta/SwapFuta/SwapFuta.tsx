import { useContext, useState } from 'react';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';
import Comments from '../../../components/Futa/Comments/Comments';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import { ChartContext } from '../../../contexts/ChartContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import Swap from '../../platformAmbient/Trade/Swap/Swap';
import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';

function SwapFuta() {
    const tradeWrapperID = 'swapFutaTradeWrapper';

    const showActiveMobileComponent = useMediaQuery('(max-width: 768px)');

    const { isCandleDataNull, isFullScreen } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const [activeTab, setActiveTab] = useState('Trade');

    const tabs = [
        {
            id: 'Trade',
            label: 'Trade',

            data: <Swap isOnTradeRoute />,
        },
        !isCandleDataNull && isPoolInitialized
            ? {
                  id: 'Chart',
                  label: 'Chart',
                  data: (
                      <>
                          <Trade futaActiveTab={activeTab} />
                      </>
                  ),
              }
            : null,
        {
            id: 'Comments',
            label: 'Comments',
            data: (
                <Comments
                    isForTrade={true}
                    resizeEffectorSelector={tradeWrapperID}
                />
            ),
        },
    ];

    const mobileTabs = (
        <div
            className={styles.mobile_tabs_container}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${tabs.length}, 1fr)`, // Dynamic grid based on tab count
            }}
        >
            {tabs
                .filter((tab) => tab !== null && tab !== undefined)
                .map((tab) => (
                    <button
                        key={tab?.id}
                        className={`${styles.tabButton} ${activeTab === tab?.id ? styles.activeTab : ''}`}
                        onClick={() => {
                            if (tab?.id) setActiveTab(tab.id);
                        }}
                        style={{
                            color:
                                activeTab === tab?.id
                                    ? 'var(--accent1)'
                                    : 'var(--text2)',
                            border:
                                activeTab === tab?.id
                                    ? '1px solid var(--accent1)'
                                    : '1px solid transparent',
                        }}
                    >
                        {tab?.label}
                    </button>
                ))}
        </div>
    );

    const activeTabData = tabs.find((tab) => tab?.id === activeTab)?.data;

    const mobileSwap = (
        <section
            className={
                activeTab === 'Chart'
                    ? styles.chart_mobile_container
                    : styles.mobile_container
            }
            style={{ height: '100%' }}
        >
            {mobileTabs}

            <div style={{ height: '100%' }}>{activeTabData}</div>
        </section>
    );

    if (showActiveMobileComponent) return mobileSwap;

    // !important:  the top-level component CSS grid and as such, the three
    // !important:  ... `<div>` elems need to stay in place to preserve
    // !important:  ... layout, more permanently we should switch to a CSS
    // !important:  ... flexbox layout or refactor to change grid alignment

    return (
        <section className={styles.mainSection}>
            <div
                className={styles.chartSection}
                style={
                    isFullScreen ? { gridColumnStart: 1, gridColumnEnd: 4 } : {}
                }
            >
                <Divider count={2} />
                <Trade futaActiveTab={activeTab} />
            </div>

            <div style={{ paddingBottom: '4px' }}>
                {
                    // code below this line no longer needed but wrapper needs to
                    // ... exist to preserve page layout sans further CSS changes
                    // <Separator dots={100} />
                }
            </div>
            <div>
                <span id={tradeWrapperID}>
                    <Divider count={2} />
                    <Swap isOnTradeRoute />
                </span>
                <Divider count={2} />
                <Comments
                    isForTrade={true}
                    isSmall={true}
                    resizeEffectorSelector={tradeWrapperID}
                />
            </div>
        </section>
    );
}

export default SwapFuta;
