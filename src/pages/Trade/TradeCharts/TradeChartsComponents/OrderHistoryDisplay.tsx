import styles from './VolumeTVLFee.module.css';
import { Dispatch, SetStateAction, useState, useRef, memo } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { LS_KEY_ORDER_HISTORY_SETTINGS } from '../../../../ambient-utils/constants';

interface OrderHistoryDisplayPropsIF {
    setShowSwap: Dispatch<SetStateAction<boolean>>;
    setShowLiquidity: Dispatch<SetStateAction<boolean>>;
    setShowHistorical: Dispatch<SetStateAction<boolean>>;
    showSwap: boolean;
    showLiquidity: boolean;
    showHistorical: boolean;
}
function OrderHistoryDisplay(props: OrderHistoryDisplayPropsIF) {
    const {
        setShowSwap,
        // setShowLiquidity,
        // setShowHistorical,
        showSwap,
        showLiquidity,
        showHistorical,
    } = props;

    const updateOrderHistoryToggles = (newStatus: {
        isSwapOrderHistoryEnabled: boolean;
        isLiquidityOrderHistoryEnabled: boolean;
        isHistoricalOrderHistoryEnabled: boolean;
    }) => {
        localStorage.setItem(
            LS_KEY_ORDER_HISTORY_SETTINGS,
            JSON.stringify({ ...newStatus }),
        );
    };

    const [
        showOrderHistoryDisplayDropdown,
        setShowOrderHistoryDisplayDropdown,
    ] = useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const handleSwapToggle = () => {
        setShowSwap(!showSwap);
        updateOrderHistoryToggles({
            isSwapOrderHistoryEnabled: !showSwap,
            isLiquidityOrderHistoryEnabled: showLiquidity,
            isHistoricalOrderHistoryEnabled: showHistorical,
        });
    };

    // const handleLiquidityToggle = () => {
    //     setShowLiquidity(!showLiquidity);
    //     updateOrderHistoryToggles({
    //         isSwapOrderHistoryEnabled: showSwap,
    //         isLiquidityOrderHistoryEnabled: !showLiquidity,
    //         isHistoricalOrderHistoryEnabled: showHistorical,
    //     });
    // };
    // const handleHistoricalToggle = () => {
    //     setShowHistorical(!showHistorical);
    //     updateOrderHistoryToggles({
    //         isSwapOrderHistoryEnabled: showSwap,
    //         isLiquidityOrderHistoryEnabled: showLiquidity,
    //         isHistoricalOrderHistoryEnabled: !showHistorical,
    //     });
    // };

    const orderHistoryDisplay = [
        { name: 'Buys/Sells', selected: showSwap, action: handleSwapToggle },
        // {
        //     name: 'Liquidity',
        //     selected: showLiquidity,
        //     action: handleLiquidityToggle,
        // },
        // {
        //     name: 'Historical',
        //     selected: showHistorical,
        //     action: handleHistoricalToggle,
        // },
    ];

    const wrapperStyle = showOrderHistoryDisplayDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const dropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowOrderHistoryDisplayDropdown(false);
    };
    useOnClickOutside(dropdownItemRef, clickOutsideHandler);

    function handleCurveDepthClickMobile(action: () => void) {
        action();
        setShowOrderHistoryDisplayDropdown(false);
    }

    const OrderHistoryDisplayMobile = (
        <div className={styles.dropdown_menu} ref={dropdownItemRef}>
            <button
                className={styles.volume_tvl_fee_mobile_button}
                onClick={() =>
                    setShowOrderHistoryDisplayDropdown(
                        !showOrderHistoryDisplayDropdown,
                    )
                }
                tabIndex={0}
                aria-label='Open volume and tvl dropdown.'
            >
                Buys/Sells
                {/* {showSwap ? 'Buys/Sells' : showHistorical ? 'Historical' : ''} */}
                {/* showLiquidity
                    ? 'Liquidity'
                    : ''} */}
            </button>

            <div className={wrapperStyle}>
                {orderHistoryDisplay.map((button, idx) => (
                    <div className={styles.volume_tvl_container} key={idx}>
                        <button
                            onClick={() =>
                                handleCurveDepthClickMobile(button.action)
                            }
                            className={
                                button.selected
                                    ? styles.active_selected_button
                                    : styles.non_active_selected_button
                            }
                            aria-label={`Show ${button.name}.`}
                        >
                            {button.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (desktopView) return OrderHistoryDisplayMobile;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {orderHistoryDisplay.map((button, idx) => (
                <div className={styles.volume_tvl_container} key={idx}>
                    <button
                        onClick={button.action}
                        className={
                            button.selected
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label={`${button.selected ? 'hide' : 'show'} ${
                            button.name
                        }.`}
                    >
                        {button.name}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default memo(OrderHistoryDisplay);
