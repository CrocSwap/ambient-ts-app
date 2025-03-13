import { useEffect, useRef } from 'react';
import { User, getUserLabel } from '../../../Model/UserModel';
import styles from './MentionAutoComplete.module.css';

interface MentionAutoCompleteProps {
    userList: User[];
    selectedUser: User | null;
    active: boolean;
    userPickerForMention: (user: User) => void;
    setMentPanelActive: (active: boolean) => void;
}

export default function MentionAutoComplete(props: MentionAutoCompleteProps) {
    const selectedUserRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (selectedUserRef.current) {
            selectedUserRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [props.selectedUser]);

    const usersDom = (
        <span>
            {props.userList.map((user) => {
                const isSelected = props.selectedUser?._id === user._id;

                return (
                    <div
                        key={user._id}
                        ref={isSelected ? selectedUserRef : null}
                        className={`${styles.ment_autocomp_user_wrapper} ${
                            isSelected ? styles.ment_autocomp_user_selected : ''
                        }`}
                        onClick={() => props.userPickerForMention(user)}
                    >
                        {getUserLabel(user)}
                    </div>
                );
            })}
        </span>
    );

    return (
        <>
            <div
                className={`${styles.ment_autocomp_topbar} ${
                    props.active ? styles.ment_autocomp_topbar_active : ''
                }`}
            >
                <div
                    className={styles.ment_autocomp_close_btn}
                    onClick={() => props.setMentPanelActive(false)}
                >
                    X
                </div>
            </div>
            <div
                className={`${styles.ment_autocomp_wrapper} ${
                    props.active ? styles.ment_autocomp_wrapper_active : ''
                }`}
            >
                {usersDom}
            </div>
        </>
    );
}
