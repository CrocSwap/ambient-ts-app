import styles from './NoTableData.module.css';
// import{ AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

interface NoTableDataPropsIF {
    type: string;
    setSelectedDate?: Dispatch<number | undefined>;
    isAccountView: boolean;
    activeUserPositionsLength?: number;
    activeUserPositionsByPoolLength?: number;
}
function NoTableData(props: NoTableDataPropsIF) {
    const {
        type,
        setSelectedDate,
        isAccountView,
        activeUserPositionsLength,
        activeUserPositionsByPoolLength,
    } = props;

    const { showAllData, setShowAllData } = useContext(TradeTableContext);

    const navigate = useNavigate();

    const toggleAllEnabled = () => {
        IS_LOCAL_ENV && console.debug('setting show all to true');
        setShowAllData(true);
        setSelectedDate && setSelectedDate(undefined);
    };

    const navigateToLiquidityTabOnAccount = () => {
        type === 'liquidity'
            ? navigate('/account/liquidity')
            : type === 'limits'
              ? navigate('/account/limits')
              : navigate('/account');
    };

    const toggleAllEnabledContentOrNull =
        isAccountView ||
        (showAllData &&
            !activeUserPositionsByPoolLength &&
            !activeUserPositionsLength) ? null : (
            <>
                <p>
                    {activeUserPositionsLength
                        ? `Click to view your ${type}`
                        : activeUserPositionsByPoolLength
                          ? `Click to view all your ${type}`
                          : `Consider turning on all ${type}`}
                </p>
                <button
                    onClick={
                        activeUserPositionsByPoolLength
                            ? () => setShowAllData(false)
                            : activeUserPositionsLength
                              ? navigateToLiquidityTabOnAccount
                              : toggleAllEnabled
                    }
                >
                    {activeUserPositionsByPoolLength
                        ? `My ${type}`
                        : activeUserPositionsLength
                          ? `All My ${type}`
                          : `All ${type}`}
                </button>
            </>
        );

    const message = activeUserPositionsByPoolLength ? (
        `YOU HAVE ${activeUserPositionsByPoolLength} ${type === 'liquidity' ? (activeUserPositionsByPoolLength > 1 ? 'POSITIONS' : 'POSITION') : type === 'limits' ? (activeUserPositionsByPoolLength > 1 ? 'LIMITS' : 'LIMIT') : activeUserPositionsByPoolLength > 1 ? 'TRANSACTIONS' : 'TRANSACTION'} IN THIS POOL`
    ) : activeUserPositionsLength && activeUserPositionsLength > 0 ? (
        `YOU HAVE ${activeUserPositionsLength} ${type === 'liquidity' ? (activeUserPositionsLength > 1 ? 'POSITIONS' : 'POSITION') : type === 'limits' ? (activeUserPositionsLength > 1 ? 'LIMITS' : 'LIMIT') : activeUserPositionsLength > 1 ? 'TRANSACTIONS' : 'TRANSACTION'} IN OTHER POOLS`
    ) : (
        <h2>NO {type.toUpperCase()} FOUND</h2>
    );

    return (
        <div className={styles.container}>
            {/* <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} /> */}
            {message}
            {toggleAllEnabledContentOrNull}
        </div>
    );
}

export default memo(NoTableData);
