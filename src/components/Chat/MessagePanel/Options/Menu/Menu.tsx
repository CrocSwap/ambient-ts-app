import { Dispatch, SetStateAction } from 'react';
import styles from './Menu.module.css';
import { FiArrowLeft, FiDelete, FiInfo, FiRotateCw } from 'react-icons/fi';
import { BsFillReplyFill, BsEmojiSmileUpsideDown } from 'react-icons/bs';
interface propsIF {
    isMessageDeleted: boolean;
    setIsMessageDeleted: Dispatch<SetStateAction<boolean>>;
    setIsMoreButtonPressed: Dispatch<SetStateAction<boolean>>;
    setFlipped: Dispatch<SetStateAction<boolean>>;
    deleteMsgFromList: any;
    id: string;
}
export default function Menu(props: propsIF) {
    const closePanel = () => {
        console.log('id: ', props.id);
        props.setIsMessageDeleted(true);
        props.deleteMsgFromList(props.id).then((result: any) => {
            if (result.status === 'OK') {
                props.setIsMessageDeleted(true);
                return result;
            } else {
                props.setIsMessageDeleted(false);
            }
        });
        props.setIsMoreButtonPressed(false);
    };

    const options = [
        {
            label: 'Reply',
            icon: <BsFillReplyFill size={10} />,
            listener: undefined,
        },
        {
            label: 'Add Reaction',
            icon: <BsEmojiSmileUpsideDown size={10} />,
            listener: undefined,
        },
        { label: 'Delete', icon: <FiDelete size={10} />, listener: closePanel },
        {
            label: 'Details',
            icon: <FiArrowLeft size={10} />,
            listener: () => props.setFlipped(true),
        },
    ];

    return (
        <div className={styles.dropdown_item}>
            {options.map((option, index) => {
                return (
                    <>
                        <div
                            className={styles.dropdown_node}
                            onClick={() => {
                                if (option.listener) option.listener();
                            }}
                            style={{
                                animationDelay: `${
                                    (options.length - index - 1) * 0.1
                                }s`,
                            }}
                        >
                            <div className={styles.dropdown_node_icon}>
                                {option.icon}
                            </div>
                            <div className={styles.dropdown_node_label}>
                                {option.label}
                            </div>
                        </div>
                    </>
                );
            })}

            {/*             
            <BsFillReplyFill size={10} />
            <BsEmojiSmileUpsideDown size={10} />
            <FiDelete
                size={10}
                color='red'
                onClick={() => {
                    closePanel();
                }}
            /> */}
        </div>
    );
}
