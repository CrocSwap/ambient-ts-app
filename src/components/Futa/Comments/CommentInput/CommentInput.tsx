import { useRef, useState } from 'react';
import styles from './CommentInput.module.css';
import { AiOutlineSend } from 'react-icons/ai';
import { isLinkInCrocodileLabsLinksForInput } from '../../../Chat/ChatUtils';
import { domDebug } from '../../../Chat/DomDebugger/DomDebuggerUtils';

interface CommentInputProps {
    commentInputDispatch: (message: string) => void;
    currentUserID: string;
}

export default function CommentInput(props: CommentInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const _characterLimit = 180;
    const [message, setMessage] = useState('');
    const _onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const inputVal = e.currentTarget.value;
        const pressedKey = e.key;

        if (pressedKey == 'Enter' && inputVal.trim().length > 0) {
            sendAction(inputVal);
        }

        const result = isLinkInCrocodileLabsLinksForInput(inputVal);
        domDebug('islinkincrocodilelabs', result);
        setMessage(inputVal);
    };

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
    };

    return (
        <>
            <div className={styles.comment_input_wrapper}>
                {props.currentUserID && props.currentUserID.length > 0 ? (
                    <>
                        <input
                            ref={inputRef}
                            placeholder='ENTER MESSAGE...'
                            onKeyUp={_onKeyUp}
                            onKeyDown={_onKeyDown}
                        />
                        <AiOutlineSend
                            onClick={() => {
                                sendAction(message);
                            }}
                            size={15}
                        />
                    </>
                ) : (
                    <></>
                )}
            </div>
        </>
    );
}
