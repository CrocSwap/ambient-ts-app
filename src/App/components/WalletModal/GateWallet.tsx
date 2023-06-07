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
                    This website is a public{' '}
                    <a
                        href={termUrls.openSource}
                        target='_blank'
                        rel='noreferrer'
                        aria-label='open source repo'
                    >
                        open source web application
                    </a>{' '}
                    to access the blockchain-based Ambient protocol.
                </p>
                <p>
                    By clicking Agree, you accept the{' '}
                    <a
                        href={`${window.location.origin}/${termUrls.tos}`}
                        target='_blank'
                        rel='noreferrer'
                        aria-label='terms of service'
                    >
                        Terms of Service
                    </a>
                    .
                </p>
                <p>
                    Site Privacy Policy can be{' '}
                    <a
                        href={`${window.location.origin}/${termUrls.privacy}`}
                        target='_blank'
                        rel='noreferrer'
                        aria-label='site policy'
                    >
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
