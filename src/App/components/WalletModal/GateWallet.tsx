import styles from './GateWallet.module.css';
import Button from '../../../components/Global/Button/Button';
import { Dispatch, SetStateAction } from 'react';

interface PropsIF {
    isDontShowChecked: boolean;
    setIsDontShowChecked: Dispatch<SetStateAction<boolean>>;
    showGateWallet: boolean;
    setShowGateWallet: Dispatch<SetStateAction<boolean>>;
}
export default function GateWallet(props: PropsIF) {
    const { isDontShowChecked, setIsDontShowChecked, setShowGateWallet } =
        props;
    const handleChange = () => {
        setIsDontShowChecked(!isDontShowChecked);
        // save to local storage
    };

    const handleAcceptClick = () => {
        setShowGateWallet(false);

        // save to local storage
    };

    return (
        <div className={styles.main_container}>
            <section>
                <p>
                    You are leaving ambient.finance and will be redirected to a
                    third party, independent website.
                </p>
                <p>
                    The website is s community deployed and maintained instance
                    of the open source <a href='#'>ambient front end</a>, hosted
                    and served on the distributed, peer-to-peer{' '}
                    <a href='#'>IPFS network</a>.
                </p>

                <p>
                    Alternative links can be found in the <a href='#'>docs</a>.
                </p>
            </section>

            <section>
                <p>
                    By clicking Agree, you accept the{' '}
                    <a href='#'>Terms of Service</a>.
                </p>

                <div className={styles.checkbox}>
                    <input
                        type='checkbox'
                        checked={isDontShowChecked}
                        onChange={handleChange}
                    />
                    <p>Don`&#39;t show this message again for 30 days.</p>
                </div>
                <Button flat title='Agree' action={handleAcceptClick} />
            </section>
        </div>
    );
}
