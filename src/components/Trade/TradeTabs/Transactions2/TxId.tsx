import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { FlexContainer, Text } from '../../../../styled/Common';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { useContext } from 'react';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { TransactionServerIF } from '../../../../ambient-utils/types/transaction/TransactionServerIF';
import { trimString } from '../../../../ambient-utils/dataLayer/functions/trimString';

interface propsIF {
    tx: TransactionServerIF;
    width: number;
}

export default function TxId(props: propsIF) {
    const { tx, width } = props;

    const { chainData: { blockExplorer } } = useContext(CrocEnvContext);
    const { snackbar: { open: openSnackbar } } = useContext(AppStateContext);

    const [_, copy] = useCopyToClipboard();

    function handleOpenExplorer(): void {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.txHash}`;
            window.open(explorerUrl);
        }
    }

    function handleCopyTxHash(): void {
        copy(tx.txHash);
        openSnackbar(`${tx.txHash} copied`, 'info');
    }

    return (
        <RowItem hover data-label='id' role='button' tabIndex={0} width={width}>
            <TextOnlyTooltip
                interactive
                title={
                    <FlexContainer
                        justifyContent='center'
                        background='dark3'
                        color='text1'
                        padding='12px'
                        gap={8}
                        rounded
                        font='roboto'
                        role='button'
                        style={{ width: '440px', cursor: 'pointer' }}
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <span onClick={handleOpenExplorer}>{tx.txHash}</span>
                        <FiCopy size={'12px'} onClick={handleCopyTxHash} />{' '}
                        <FiExternalLink
                            size={'12px'}
                            onClick={handleOpenExplorer}
                        />
                    </FlexContainer>
                }
                placement='right'
                enterDelay={750}
                leaveDelay={0}
            >
                <Text font='roboto'>{trimString(tx.txHash, 6, 4, '…')}</Text>
            </TextOnlyTooltip>
        </RowItem>
    );
}