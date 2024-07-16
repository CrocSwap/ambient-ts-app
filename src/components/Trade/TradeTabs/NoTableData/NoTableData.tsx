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

    const navigateToLiquidityTabOnAccount = () =>
        navigate('/account/liquidity');

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

    return (
        <div className={styles.container}>
            {/* <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} /> */}
            {activeUserPositionsLength && activeUserPositionsLength > 0 ? (
                `YOU HAVE ${activeUserPositionsLength} POSITIONS IN OTHER POOLS`
            ) : (
                <h2>NO {type.toUpperCase()} FOUND</h2>
            )}

            {!showAllData && toggleAllEnabledContentOrNull}
        </div>
    );
}

export default memo(NoTableData);
