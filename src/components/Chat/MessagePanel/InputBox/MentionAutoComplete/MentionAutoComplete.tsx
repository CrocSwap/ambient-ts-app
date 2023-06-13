import { useState } from 'react';
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
            {props.userList.map((u, index) => {
                return (
                    <div
                        key={u._id}
                        className={`${styles.ment_autocomp_user_wrapper} ${
                            props.selectedUser?._id === u._id
                                ? styles.ment_autocomp_user_selected
                                : ''
                        }`}
                    >
                        {getUserLabel(u)}
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
