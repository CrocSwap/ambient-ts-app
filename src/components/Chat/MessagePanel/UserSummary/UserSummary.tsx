import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {
    UserSummaryModel,
    getUserLabelforSummary,
} from '../../Model/UserSummaryModel';
import styles from './UserSummary.module.css';
import { getAvatarForChat } from '../../ChatRenderUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    toBottom: boolean;
    user?: UserSummaryModel;
    verticalPosition: number;
    mouseLeaveListener: any;
    mouseEnterListener: any;
}

export default function UserSummary(props: propsIF) {
    const jazziconsSeed = props.user?.walletID.toLowerCase() || '';

    const myJazzicon = (
        <Jazzicon diameter={25} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const debug = false;

    return (
        <div
            id='user_summary_wrapper'
            onMouseLeave={props.mouseLeaveListener}
            onMouseEnter={props.mouseEnterListener}
            className={`${styles.user_summary_wrapper} 
            ${props.toBottom ? styles.to_bottom : ' '}
            ${props.isActive || debug ? styles.active : ' '}
            `}
            style={{ top: props.verticalPosition + 'px' }}
        >
            {props.user && (
                <>
                    <div className={styles.summary_header}>
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
                        <div className={styles.stat_node}>
                            <div className={styles.stat_label}>
                                Deleted Messages
                            </div>
                            <div className={styles.stat_value}>
                                {props.user.deletedMessages}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
