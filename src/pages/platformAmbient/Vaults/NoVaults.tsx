import styles from './NoVaults.module.css';
import Button from '../../../components/Form/Button';

export default function NoVaults() {
    const BUTTON_DOM_ID = 'change_network_to_scroll'

    return (
        <div className={styles.no_vaults}>
            <h3>To use Vaults please change network to Scroll.</h3>
            <Button
                idForDOM={BUTTON_DOM_ID}
                title='Change to Scroll'
                action={() => console.log('wowzers')}
            />
        </div>
    );
}