import styles from './NoTableData.module.css';
// import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, memo, useContext } from 'react';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { useNavigate } from 'react-router-dom';

interface NoTableDataPropsIF {
    type: string;
    setSelectedDate?: Dispatch<number | undefined>;
    isAccountView: boolean;
    activeUserPositionsLength?: number;
}
function NoTableData(props: NoTableDataPropsIF) {
    const { type, setSelectedDate, isAccountView, activeUserPositionsLength } =
        props;

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

    const toggleAllEnabledContentOrNull = isAccountView ? null : (
        <>
            <p>
                {activeUserPositionsLength && activeUserPositionsLength > 0
                    ? `Click to view all your ${type}`
                    : `Consider turning on all ${type}`}
            </p>
            <button
                onClick={
                    activeUserPositionsLength && activeUserPositionsLength > 0
                        ? navigateToLiquidityTabOnAccount
                        : toggleAllEnabled
                }
            >
                {activeUserPositionsLength && activeUserPositionsLength > 0
                    ? `All My ${type}`
                    : `All ${type}`}
            </button>
        </>
    );

    const message =
        !showAllData &&
        activeUserPositionsLength &&
        activeUserPositionsLength > 0 ? (
            `YOU HAVE ${activeUserPositionsLength} ${type === 'liquidity' ? (activeUserPositionsLength > 1 ? 'POSITIONS' : 'POSITION') : type === 'limits' ? (activeUserPositionsLength > 1 ? 'LIMITS' : 'LIMIT') : activeUserPositionsLength > 1 ? 'TRANSACTIONS' : 'TRANSACTION'} IN OTHER POOLS`
        ) : (
            <h2>NO {type.toUpperCase()} FOUND</h2>
        );

    return (
        <div className={styles.container}>
            {/* <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} /> */}
            {message}
            {!showAllData && toggleAllEnabledContentOrNull}
        </div>
    );
}

export default memo(NoTableData);
