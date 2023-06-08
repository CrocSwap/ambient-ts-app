import { User } from '../../../Model/UserModel';
import styles from './MentionAutoComplete.module.css';

interface MentionAutoCompleteProps {
    userList: User[];
    selectedUser: User | null;
    active: boolean;
    queryStr?: string;
}

export default function MentionAutoComplete(props: MentionAutoCompleteProps) {
    const userLabel = (user: User) => {
        if (
            user.ensName != null &&
            user.ensName != '' &&
            user.ensName != undefined &&
            user.ensName != 'undefined' &&
            user.ensName != 'null'
        ) {
            return user.ensName;
        }
        return (
            user.walletID.substring(0, 6) +
            '...' +
            user.walletID.substring(user.walletID.length - 4)
        );
    };

    const userLabelForFilter = (user: User) => {
        if (
            user.ensName != null &&
            user.ensName != '' &&
            user.ensName != undefined &&
            user.ensName != 'undefined' &&
            user.ensName != 'null'
        ) {
            return user.ensName.toLowerCase();
        }
        return user.walletID.toLowerCase();
    };

    const usersDom = (
        <span>
            {props.userList.map((u, index) => {
                if (
                    props.queryStr &&
                    props.queryStr.length > 0 &&
                    !userLabelForFilter(u)
                        .toLowerCase()
                        .includes(props.queryStr.toLowerCase())
                ) {
                    return null;
                }
                return (
                    <div
                        key={u._id}
                        className={`${styles.ment_autocomp_user_wrapper} ${
                            props.selectedUser?._id === u._id
                                ? styles.ment_autocomp_user_selected
                                : ''
                        }`}
                    >
                        {userLabel(u)}
                    </div>
                );
            })}
        </span>
    );

    return (
        <div
            className={`${styles.ment_autocomp_wrapper} ${
                props.active ? styles.ment_autocomp_wrapper_active : ''
            }`}
        >
            {/* <input ref={props.inputRef}  className={styles.ment_autocomp_input}></input> */}
            {usersDom}
        </div>
    );
}
