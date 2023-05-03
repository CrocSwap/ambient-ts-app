import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { useContext } from 'react';
import { UserPreferenceContext } from '../../contexts/UserPreferenceContext';

// eslint-disable-next-line
export default function TestPage() {
    const { bypassConfirmSwap } = useContext(UserPreferenceContext);

    return (
        <section className={styles.main}>
            <p>
                Confirmation for swap is:{' '}
                {JSON.stringify(bypassConfirmSwap.isEnabled)}
            </p>
            <button onClick={() => bypassConfirmSwap.enable()}>
                Turn it on!
            </button>
            <button onClick={() => bypassConfirmSwap.disable()}>
                Turn it off!
            </button>
        </section>
    );
}
