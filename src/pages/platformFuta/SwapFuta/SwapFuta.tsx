import { useContext, useEffect, useState } from 'react';
import Divider from '../../../components/Futa/Divider/FutaDivider';
import Separator from '../../../components/Futa/Separator/Separator';
import Comments from '../../../components/Futa/Comments/Comments';
import Swap from '../../platformAmbient/Trade/Swap/Swap';

import Trade from '../../platformAmbient/Trade/Trade';
import styles from './SwapFuta.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

import { ChartContext } from '../../../contexts/ChartContext';
import { useSimulatedIsPoolInitialized } from '../../../App/hooks/useSimulatedIsPoolInitialized';
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import { Outlet } from 'react-router-dom';
import { useUrlParams } from '../../../utils/hooks/useUrlParams';
import { TokenContext } from '../../../contexts/TokenContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

// import logo from '../../../assets/futa/logos/homeLogo.svg';

function SwapFuta() {
    const tradeWrapperID = 'swapFutaTradeWrapper';

    const showActiveMobileComponent = useMediaQuery('(max-width: 768px)');

    const {

        limitTick,

    } = useContext(TradeDataContext);

    const { isCandleDataNull } = useContext(ChartContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();
    const {
        chainData: { chainId },
        provider,
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const { urlParamMap, updateURL } = useUrlParams(tokens, chainId, provider);

   
    const [activeTab, setActiveTab] = useState('Trade');

    const tabs = [
        {
            id: 'Trade',
            label: 'Trade',
            
            data: <Swap isOnTradeRoute />
        },
        !isCandleDataNull &&
        isPoolInitialized ?  {
            id: 'Chart',
            label: 'Chart',
            data: (
                <>
                    <Trade/>
                </>
            ),
        } : null,
        { id: 'Comments', label: 'Comments', data: <Comments
            isForTrade={true}
            resizeEffectorSelector={tradeWrapperID}
        /> },
       
    ];

    

    
    const mobileTabs = (
        <div 
            className={styles.mobile_tabs_container}
            style={{
                display: 'grid', 
                gridTemplateColumns: `repeat(${tabs.length }, 1fr)` // Dynamic grid based on tab count
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
                            color: activeTab === tab?.id ? 'var(--accent1)' : 'var(--text2)',
                            border: activeTab === tab?.id ? '1px solid var(--accent1)' : '1px solid transparent',
                        }}
                    >
                        {tab?.label}
                    </button>
                ))}
        </div>
    );
    
    const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

    useEffect(() => {
        const calculateHeight = () => {
            const totalHeight = window.innerHeight;
            const heightToSubtract = 56 + 56; // Subtract 56px from top and 56px from bottom
            setAvailableHeight(totalHeight - heightToSubtract);
        };

        calculateHeight(); // Calculate initial height
        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    const contentHeight = availableHeight - 75;
    const activeTabData = tabs.find((tab) => tab?.id === activeTab)?.data;


    const mobileSwap = (
        <section className={styles.mobile_container}
        style={{ height: `${availableHeight}px` }}
        
        >
            {mobileTabs}
            
            <div style={{ height: `${contentHeight}px`, overflowY: 'scroll' }}>
                {activeTabData}
            </div>

      
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
