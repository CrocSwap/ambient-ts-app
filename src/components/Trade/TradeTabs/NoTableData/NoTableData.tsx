import styles from './NoTableData.module.css';
import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, SetStateAction } from 'react';
import { CandleData } from '../../../../utils/state/graphDataSlice';

interface NoTableDataPropsIF {
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>> | undefined;
    type: string;
    // setIsCandleSelected?: Dispatch<SetStateAction<boolean | undefined>>;
    changeState?: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    setSelectedDate?: Dispatch<Date | undefined>;
}
export default function NoTableData(props: NoTableDataPropsIF) {
    const { isShowAllEnabled, setIsShowAllEnabled, type, changeState, setSelectedDate } = props;

    const toggleAllEnabled = () => {
        console.log('setting show all to true');
        setIsShowAllEnabled ? setIsShowAllEnabled(true) : null;
        // setIsCandleSelected ? setIsCandleSelected(false) : null;
        changeState ? changeState(false, undefined) : null;
        setSelectedDate ? setSelectedDate(undefined) : null;
    };

    const toggleAllEnabledContent = (
        <>
            <p>Consider turning on all {type}</p>
            <button onClick={toggleAllEnabled}>All {type}</button>
        </>
    );

    return (
        <div className={styles.container}>
            <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} />
            <h2>NO DATA FOUND</h2>
            {!isShowAllEnabled && toggleAllEnabledContent}
        </div>
    );
}
