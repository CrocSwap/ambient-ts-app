import { useNavigate } from 'react-router-dom';
import { getAvatarForChat } from '../../ChatRenderUtils';
import {
    UserSummaryModel,
    getUserLabelforSummary,
} from '../../Model/UserSummaryModel';
import styles from './UserSummary.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    toBottom: boolean;
    user?: UserSummaryModel;
    verticalPosition: number;
    mouseLeaveListener: any;
    mouseEnterListener: any;
    isCurrentUser?: boolean;
    showExtendedSummary?: boolean;
}

export default function UserSummary(props: propsIF) {
    const debug = false;

    const navigate = useNavigate();

    const goToProfile = () => {
        if (props.user) {
            navigate(
                props.isCurrentUser
                    ? 'account'
                    : props.user?.ensName
                    ? props.user?.ensName
                    : props.user?.walletID,
            );
        }
    };

    return (
        <div
            id='user_summary_wrapper'
            // onMouseLeave={props.mouseLeaveListener}
            onMouseEnter={props.mouseEnterListener}
            className={`${styles.user_summary_wrapper} 
            ${props.toBottom ? styles.to_bottom : ' '}
            ${props.isActive || debug ? styles.active : ' '}
            `}
            style={{ top: props.verticalPosition + 'px' }}
        >
            {props.user && (
                <>
                    <div
                        className={styles.summary_header}
                        onClick={goToProfile}
                    >
                        <span className={styles.user_avatar}>
                            {getAvatarForChat(props.user)}
                        </span>
                        <span className={styles.user_name}>
                            {getUserLabelforSummary(props.user)}
                        </span>
                    </div>
                    <div className={styles.stats_content}>
                        <div className={styles.stat_node}>
                            <div className={styles.stat_label}>
                                Total Messages
                            </div>
                            <div className={styles.stat_value}>
                                {props.user.totalMessages}
                            </div>
                        </div>
                        {props.showExtendedSummary && (
                            <>
                                <div className={styles.stat_node}>
                                    <div className={styles.stat_label}>
                                        Deleted Messages
                                    </div>
                                    <div className={styles.stat_value}>
                                        {props.user.deletedMessages}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
