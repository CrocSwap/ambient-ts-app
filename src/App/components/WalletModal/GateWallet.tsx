import styles from './GateWallet.module.css';
import Button from '../../../components/Global/Button/Button';
import { Dispatch, SetStateAction } from 'react';
import { TermsOfServiceUrls } from '../../hooks/useTermsAgreed';

interface PropsIF {
    termUrls: TermsOfServiceUrls;
    recordAgreed: () => void;
}
export default function GateWallet(props: PropsIF) {
    const { termUrls, recordAgreed } = props;

    return (
        <div className={styles.main_container}>
            <section>
                <p>
                    This website is a community maintained open source instance
                    of <a href={termUrls.openSource}>the front end</a> for the
                    Ambient protocol.
                </p>
                <p>
                    By clicking Agree, you accept the{' '}
                    <a href={termUrls.tos}>Terms of Service</a>.
                </p>
                <p>
                    Site Privacy Policy can be{' '}
                    <a href={termUrls.privacy}>found here</a>.
                </p>
            </section>
            <section>
                <Button flat title='Agree' action={recordAgreed} />
            </section>
        </div>
    );
}
