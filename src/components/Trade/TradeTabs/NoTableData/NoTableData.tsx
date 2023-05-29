import styles from './NoTableData.module.css';
// import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, memo, useContext } from 'react';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { IS_LOCAL_ENV } from '../../../../constants';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';

interface NoTableDataPropsIF {
    type: string;
    // setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    setSelectedDate?: Dispatch<number | undefined>;
    isAccountView: boolean;
}
function NoTableData(props: NoTableDataPropsIF) {
    const { type, setSelectedDate, isAccountView } = props;

    const { showAllData, setShowAllData } = useContext(TradeTableContext);

    const toggleAllEnabled = () => {
        IS_LOCAL_ENV && console.debug('setting show all to true');
        setShowAllData(true);
        setSelectedDate && setSelectedDate(undefined);
    };

    const toggleAllEnabledContentOrNull = isAccountView ? null : (
        <>
            <p>Consider turning on all {type}</p>
            <button onClick={toggleAllEnabled}>All {type}</button>
        </>
    );

    return (
        <div className={styles.container}>
            {/* <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} /> */}
            <h2>NO {type.toUpperCase()} FOUND</h2>
            {!showAllData && toggleAllEnabledContentOrNull}
        </div>
    );
}

export default memo(NoTableData);
