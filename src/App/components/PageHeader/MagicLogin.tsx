import { useState, useEffect } from 'react';
import styles from './MagicLogin.module.css';
// import Button from '../../../components/Global/Button/Button';

interface IMagicLoginProps {
    closeModal: () => void;
}

export default function MagicLogin(props: IMagicLoginProps) {
    console.log({ props });
    const [email, setEmail] = useState('');
    // const [message, setMessage] = useState('Please enter a valid email address');
    // const [disable, setDisable] = useState(true);

    // Magic Authentication
    // const handleCustomLogin = async () => {
    //     await authenticate({
    //         provider: 'magicLink',
    //         email: email,
    //         apiKey: 'pk_live_E2BB731C9C90E127', // Enter API key from Magic Dashboard https://dashboard.magic.link/
    //         network: 'rinkeby',
    //     });
    //     props.closeModal();
    // };

    const handleEmailValidation = () => {
        const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (regEx.test(email)) {
            // setMessage('Send Login Link');
            // setDisable(false);
        } else if (!regEx.test(email) && email !== '') {
            // setMessage('Please enter a valid email address');
            // setDisable(true);
        } else if (email == '') {
            // setDisable(true);
        } else {
            // setMessage('Please enter a valid email address');
            // setDisable(true);
        }
    };

    useEffect(() => {
        handleEmailValidation();
    }, [email]);

    return (
        <div className={styles.card_container}>
            {/* {isAuthenticating && <p className='green'>Authenticating</p>} */}
            {/* {authError && <p className='error'>{JSON.stringify(authError.message)}</p>} */}

            <div className={styles.user_box}>
                <input
                    type={'email'}
                    className='input'
                    // placeholder='Email'
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                />
                <label>Email</label>
                {/* <Button title={message} action={handleCustomLogin} disabled={disable} flat={true} /> */}
            </div>
        </div>
    );
}
