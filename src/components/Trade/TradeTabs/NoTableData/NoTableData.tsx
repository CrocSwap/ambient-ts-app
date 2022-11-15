import styles from './NoTableData.module.css';
import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, SetStateAction } from 'react';
import { set } from 'immer/dist/internal';

interface NoTableDataPropsIF {
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>> | undefined;
}
export default function NoTableData(props: NoTableDataPropsIF) {
    const { isShowAllEnabled, setIsShowAllEnabled } = props;

    const toggleAllEnabled = () => {
        setIsShowAllEnabled ? setIsShowAllEnabled(true) : '';
    };

    const toggleAllEnabledContent = (
        <>
            <p>Consider turning on all transactions</p>
            <button onClick={toggleAllEnabled}>All Transactions</button>
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
