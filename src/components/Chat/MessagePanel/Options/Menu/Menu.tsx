import { Dispatch, SetStateAction } from 'react';
import styles from './Menu.module.css';
import { FiDelete } from 'react-icons/fi';
// interface propsIF {

// }
export default function Menu() {
    return (
        <div className={styles.dropdown_item}>
            <FiDelete size={10} color='red' />
            <FiDelete size={10} color='red' />
            <FiDelete size={10} color='red' />
        </div>
    );
}
