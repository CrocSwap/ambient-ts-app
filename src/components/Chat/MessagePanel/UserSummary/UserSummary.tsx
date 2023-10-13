import styles from './UserSummary.module.css';
import { UserSummary } from '../../Model/UserSummaryModel';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    toBottom: boolean;
    user?: UserSummary;
}

export default function UserSummary(props: propsIF) {
    return (
        <div
            className={`${styles.user_summary_wrapper} ${
                props.toBottom ? styles.to_bottom : ' '
            }`}
        >
            {props.user && <></>}
        </div>
    );
}
