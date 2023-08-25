import { Dispatch, SetStateAction } from 'react';
import styles from './Menu.module.css';
import { FiDelete } from 'react-icons/fi';
import { BsFillReplyFill, BsEmojiSmileUpsideDown } from 'react-icons/bs';
interface propsIF {
    isDeleteMessageButtonPressed: boolean;
    setIsDeleteMessageButtonPressed: Dispatch<SetStateAction<boolean>>;
    setIsMoreButtonPressed: Dispatch<SetStateAction<boolean>>;
}
export default function Menu(props: propsIF) {
    function closePanel() {
        props.setIsDeleteMessageButtonPressed(true);
        props.setIsMoreButtonPressed(false);
    }
    return (
        <div className={styles.dropdown_item}>
            <BsFillReplyFill size={10} />
            <BsEmojiSmileUpsideDown size={10} />
            <FiDelete
                size={10}
                color='red'
                onClick={() => {
                    closePanel();
                }}
            />
        </div>
    );
}
