import styles from './NoTableData.module.css';
import { AiFillFolderOpen } from 'react-icons/ai';
import { Dispatch, SetStateAction } from 'react';

interface NoTableDataPropsIF {
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>> | undefined;
    type: string;
}
export default function NoTableData(props: NoTableDataPropsIF) {
    const { isShowAllEnabled, setIsShowAllEnabled, type } = props;

    const toggleAllEnabled = () => {
        setIsShowAllEnabled ? setIsShowAllEnabled(true) : '';
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
