import { useContext, useRef, useState } from 'react';
import { AiOutlineSend } from 'react-icons/ai';
import styles from './CommentInput.module.css';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppStateContext } from '../../../../contexts/AppStateContext';
import CircularProgressBarForComments from '../../../Global/OpenOrderStatus/CircularProgressBarForComments';

interface CommentInputProps {
    commentInputDispatch: (message: string) => void;
    currentUserID: string;
}

export default function CommentInput(props: CommentInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [inputLength, setInputLength] = useState(0);
    const _characterLimit = 180;
    const [message, setMessage] = useState('');
    const _onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputVal = e.currentTarget.value;
        const pressedKey = e.key;

        if (pressedKey == 'Enter' && inputVal.trim().length > 0) {
            sendAction(inputVal);
        }
        setMessage(inputVal);
    };

    const shouldShowCircularProgressBar = inputLength > 126;
    const fillPercentage = (inputLength / _characterLimit) * 84;

    const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
        let newMessage = e.currentTarget.value;
        if (newMessage.length > _characterLimit) {
            newMessage = newMessage.substring(0, _characterLimit);
        }
        setMessage(newMessage);
        setInputLength(newMessage.length);
        if (inputRef.current) {
            inputRef.current.value = newMessage;
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const currentText = e.currentTarget.value;
        const newText = currentText + pastedText;
        if (newText.length > _characterLimit) {
            e.preventDefault();
            const truncatedText = newText.substring(0, _characterLimit);
            setMessage(truncatedText);
            setInputLength(truncatedText.length);
            if (inputRef.current) {
                inputRef.current.value = truncatedText;
            }
        }
    };

    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const _onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.currentTarget.value.length >= _characterLimit &&
            e.key != 'Backspace' &&
            e.key != 'Delete' &&
            e.key != 'ArrowDown' &&
            e.key != 'ArrowLeft' &&
            e.key != 'ArrowUp' &&
            e.key != 'ArrowRight' &&
            !(e.ctrlKey && e.key == 'a')
        ) {
            e.preventDefault();
        }
    };

    const sendAction = (message: string) => {
        props.commentInputDispatch(message);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        setInputLength(0);
    };

    return (
        <div className={styles.comment_input_wrapper}>
            <>
                {props.currentUserID && props.currentUserID.length > 0 ? (
                    <>
                        <input
                            id='futa_comments_input'
                            ref={inputRef}
                            placeholder='ENTER MESSAGE...'
                            onKeyUp={_onKeyUp}
                            onKeyDown={_onKeyDown}
                            onInput={handleInputChange}
                            onPaste={handlePaste}
                            className={`${inputLength > 126 ? styles.about_filled : ''} `}
                        />
                        <AiOutlineSend
                            onClick={() => {
                                sendAction(message);
                            }}
                            className={styles.send_icon}
                            size={15}
                        />
                        {shouldShowCircularProgressBar && (
                            <>
                                <div className={styles.progress_wrapper}>
                                    <div className={styles.circular_progress}>
                                        <CircularProgressBarForComments
                                            radius={6}
                                            fillPercentage={fillPercentage}
                                        />
                                    </div>
                                    <span className={styles.character_limit}>
                                        {message.length}/{_characterLimit}
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            id='futa_comments_connect_wallet'
                            className={styles.connect_to_chat_placeholder}
                            onClick={openWalletModal}
                        >
                            CONNECT WALLET
                        </div>
                    </>
                )}
            </>
        </div>
    );
}
