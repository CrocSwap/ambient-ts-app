import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import Row from '../../Global/Row/Row';
import styles from './LimitActionInfo.module.css';
import { TokenContext } from '../../../contexts/TokenContext';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

interface ILimitActionInfoProps {
    type: 'Remove' | 'Claim';
    usdValue: string;
    tokenQuantity: string | undefined;
    tokenQuantityAddress: string;
    limitOrderPrice: string | undefined;
    limitOrderPriceAddress: string;
    receivingAmount: string | undefined;
    receivingAmountAddress: string;
    networkFee: string | undefined;
}

export default function LimitActionInfo(props: ILimitActionInfoProps) {
    const {
        type,
        usdValue,
        tokenQuantity,
        tokenQuantityAddress,
        limitOrderPrice,
        limitOrderPriceAddress,
        receivingAmount,
        receivingAmountAddress,
        networkFee,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { tokens } = useContext(TokenContext);
    const tokenQuantityToken: TokenIF | undefined =
        tokens.getTokenByAddress(tokenQuantityAddress);
    const limitOrderPriceToken: TokenIF | undefined = tokens.getTokenByAddress(
        limitOrderPriceAddress,
    );
    const receivingAmountToken: TokenIF | undefined = tokens.getTokenByAddress(
        receivingAmountAddress,
    );

    return (
        <div className={styles.row}>
            <div className={styles.remove_position_info}>
                <div className={styles.info_container}>
                    <Row>
                        <span>Total Value</span>
                        <div className={styles.token_price}>{usdValue}</div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>Token Quantity</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>{tokenQuantity}</p>
                            <TokenIcon
                                token={tokenQuantityToken}
                                src={uriToHttp(
                                    tokenQuantityToken?.logoURI ?? '',
                                )}
                                alt={tokenQuantityToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                    <Row>
                        <span>Limit Order Price</span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {limitOrderPrice}
                            </p>
                            <TokenIcon
                                token={limitOrderPriceToken}
                                src={uriToHttp(
                                    limitOrderPriceToken?.logoURI ?? '',
                                )}
                                alt={limitOrderPriceToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                </div>
                <div className={styles.info_container}>
                    <Row>
                        <span>
                            {type === 'Remove'
                                ? 'Return Quantity'
                                : 'Claimable Amount'}{' '}
                        </span>
                        <div className={styles.align_center}>
                            <p className={styles.info_text}>
                                {receivingAmount}
                            </p>
                            <TokenIcon
                                token={receivingAmountToken}
                                src={uriToHttp(
                                    receivingAmountToken?.logoURI ?? '',
                                )}
                                alt={receivingAmountToken?.symbol ?? '?'}
                                size='xs'
                            />
                        </div>
                    </Row>
                </div>
            </div>
            {chainId === '0x1' && (
                <div className={styles.network_fee_container}>
                    <div>
                        <span>Network Fee</span>
                    </div>
                    <span>{networkFee ? '~' + networkFee : '...'}</span>
                </div>
            )}
        </div>
    );
}
