import styles from './SoloTokenImport.module.css';
import { TokenIF } from '../../../utils/interfaces/exports';
import NoTokenIcon from '../NoTokenIcon/NoTokenIcon';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import Button from '../../Global/Button/Button';
import DividerDark from '../DividerDark/DividerDark';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
interface propsIF {
    customToken: TokenIF | null;
    chooseToken: (tkn: TokenIF, isCustom: boolean) => void;
    chainId: string;
}
export default function SoloTokenImport(props: propsIF) {
    const { customToken, chooseToken, chainId } = props;

    const chainData = lookupChain(chainId);

    const tokenLogo = customToken?.logoURI ? (
        <img src={customToken.logoURI} alt='' width='30px' />
    ) : (
        <NoTokenIcon
            tokenInitial={customToken?.symbol?.charAt(0) || '?'}
            width='30px'
        />
    );

    const tokenNotFound = (
        <div className={styles.token_not_found}>
            <p>Cound not find matching token</p>
            <AiOutlineQuestionCircle />
        </div>
    );

    if (!customToken) return tokenNotFound;
    return (
        <div className={styles.main_container}>
            <div className={styles.match_text_container}>
                <p>A match for this token was found on chain.</p>
            </div>
            <DividerDark />

            <div className={styles.token_display}>
                <div>
                    {tokenLogo}
                    <h2>{customToken?.symbol}</h2>
                </div>
                <h6>{customToken?.name}</h6>
            </div>
            <p style={{ textAlign: 'center' }}>
                This token is not listed on Coingecko or any other major
                reputable lists. Please be sure
                <a
                    href={
                        chainData.blockExplorer + 'token/' + customToken.address
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                        color: 'var(--accent2)',
                    }}
                    aria-label={customToken.symbol}
                >
                    {' '}
                    this{' '}
                </a>
                is the actual token you want to trade. Many fraudulent tokens
                will use the same name and symbol as other major tokens. Always
                conduct your own research before trading.
            </p>
            <Button
                flat
                title='Acknowledge'
                action={() => chooseToken(customToken, true)}
            />
            {/* <div className={styles.import_button}>
                
                <button onClick={() => chooseToken(customToken, true)}>
                    Acknowledge
                </button>
            </div> */}
        </div>
    );
}
