import styles from './NoTableData.module.css';
// import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, memo, SetStateAction } from 'react';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { IS_LOCAL_ENV } from '../../../../constants';

interface NoTableDataPropsIF {
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>> | undefined;
    type: string;
    // setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    changeState?: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    setSelectedDate?: Dispatch<Date | undefined>;
    isOnPortfolioPage: boolean;
}
function NoTableData(props: NoTableDataPropsIF) {
    const {
        isShowAllEnabled,
        setIsShowAllEnabled,
        type,
        setSelectedDate,
        isOnPortfolioPage,
    } = props;

    const toggleAllEnabled = () => {
        IS_LOCAL_ENV && console.debug('setting show all to true');
        setIsShowAllEnabled ? setIsShowAllEnabled(true) : null;
        setSelectedDate ? setSelectedDate(undefined) : null;
    };

    const toggleAllEnabledContentOrNull = isOnPortfolioPage ? null : (
        <>
            <p>Consider turning on all {type}</p>
            <button onClick={toggleAllEnabled}>All {type}</button>
        </>
    );

    return (
        <div className={styles.container}>
            {/* <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} /> */}
            <h2>NO {type.toUpperCase()} FOUND</h2>
            {!isShowAllEnabled && toggleAllEnabledContentOrNull}
        </div>
    );
}

export default memo(NoTableData);
