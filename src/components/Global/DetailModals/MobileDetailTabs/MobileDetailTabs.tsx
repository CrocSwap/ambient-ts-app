import { Dispatch, SetStateAction } from 'react';
import styles from './MobileDetailTabs.module.css';
interface PropsIF {
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
}
export default function MobileDetailTabs(props: PropsIF) {
    const { setShowShareComponent, showShareComponent } = props;

    return (
        <div
            className={styles.mobile_tabs_container}
            style={{ paddingBottom: showShareComponent ? '0' : '8px' }}
        >
            <button
                className={showShareComponent ? styles.active_button : ''}
                onClick={() => setShowShareComponent(true)}
            >
                Overview
            </button>
            <button
                className={!showShareComponent ? styles.active_button : ''}
                onClick={() => setShowShareComponent(false)}
            >
                Details
            </button>
        </div>
    );
}
