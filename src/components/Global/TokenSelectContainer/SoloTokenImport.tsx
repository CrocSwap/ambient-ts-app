import styles from './SoloTokenImport.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';

interface SoloTokenImportPropsIF {
    customToken: TokenIF | null;
    closeModal: () => void;
}
export default function SoloTokenImport(props: SoloTokenImportPropsIF) {
    const { customToken, closeModal } = props;
    const tokenLogo = customToken?.logoURI ? (
        <img src={customToken.logoURI} alt='' width='30px' />
    ) : (
        <NoTokenIcon tokenInitial={customToken?.symbol.charAt(0) || '?'} width='30px' />
    );

    if (!customToken) return <p style={{ textAlign: 'center' }}>No matches found</p>;
    return (
        <div className={styles.main_container}>
            <p>
                A match for this token was found on chain... Inventore molestias maiores ullam ipsa
                impedit accusantium, itaque animi vitae libero dolore!
            </p>

            <div className={styles.token_display}>
                {/* {JSON.stringify(customToken)} */}
                <div>
                    {tokenLogo}
                    <h2>{customToken?.symbol}</h2>
                </div>
                <h6>{customToken?.name}</h6>
            </div>
            <p>
                Warning message before importing. Modi sapiente molestiae voluptatibus quidem
                blanditiis repellat magnam officiis, omnis impedit nostrum?
            </p>
            <div className={styles.import_button}>
                <button onClick={closeModal}>Import</button>
            </div>
        </div>
    );
}
