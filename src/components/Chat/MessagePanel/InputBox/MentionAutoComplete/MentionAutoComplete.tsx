import { User, getUserLabel } from '../../../Model/UserModel';
import styles from './MentionAutoComplete.module.css';

interface MentionAutoCompleteProps {
    userList: User[];
    selectedUser: User | null;
    active: boolean;
    queryStr?: string;
}

export default function MentionAutoComplete(props: MentionAutoCompleteProps) {
    const usersDom = (
        <span>
            {props.userList.map((user) => {
                return (
                    <div
                        key={user._id}
                        className={`${styles.ment_autocomp_user_wrapper} ${
                            props.selectedUser?._id === user._id
                                ? styles.ment_autocomp_user_selected
                                : ''
                        }`}
                    >
                        {getUserLabel(user)}
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
            {usersDom}
        </div>
    );
}
