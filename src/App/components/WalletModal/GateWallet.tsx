import styles from './GateWallet.module.css';
import Button from '../../../components/Global/Button/Button';
import { TermsOfServiceUrls } from '../../hooks/useTermsAgreed';

interface PropsIF {
    termUrls: TermsOfServiceUrls;
    recordAgreed: () => void;
}
export default function GateWallet(props: PropsIF) {
    const { termUrls, recordAgreed } = props;

    return (
        <div className={styles.main_container}>
            <section className={styles.first_section}>
                <p>
                    This website is a community maintained open source instance
                    of{' '}
                    <a
                        href={termUrls.openSource}
                        target='_blank'
                        rel='noreferrer'
                    >
                        the front end
                    </a>{' '}
                    for the Ambient protocol.
                </p>
                <p>
                    By clicking Agree, you accept the{' '}
                    <a href={termUrls.tos} target='_blank' rel='noreferrer'>
                        Terms of Service
                    </a>
                    .
                </p>
                <p>
                    Site Privacy Policy can be{' '}
                    <a href={termUrls.privacy} target='_blank' rel='noreferrer'>
                        found here
                    </a>
                    .
                </p>
            </section>
            <section>
                <Button flat title='Agree' action={recordAgreed} />
            </section>
        </div>
    );
}
