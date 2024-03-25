import { MouseEvent, useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { FlexContainer, Text } from '../../../../styled/Common';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { trimString } from '../../../../ambient-utils/dataLayer';

interface propsIF {
    isOwnerActiveAccount: boolean;
    ownerId: string;
    isAccountPage: boolean;
    width: number;
}

export default function TxWallet(props: propsIF) {
    const { isOwnerActiveAccount, ownerId, isAccountPage, width } = props;

    // context data
    const { snackbar: { open: openSnackbar } } = useContext(AppStateContext);
    const { showAllData } = useContext(TradeTableContext);

    // custom hooks
    const [_, copy] = useCopyToClipboard();

    // TODO:    get Ben to help me turn this back on
    const ensName: string|null = null;

    // username display output for the DOM
    let usernameForDOM: string;
    if (isOwnerActiveAccount) {
        usernameForDOM = 'You';
    }
    // else if (ensName) {
        // usernameForDOM = ensName.length > 16 ? trimString(ensName, 11, 3, '…') : ensName;
    // }
    else {
        usernameForDOM = trimString(ownerId, 6, 4, '…');
    };

    // color for username in DOM
    let usernameColor: 'text1' | 'accent1' | 'accent2';
    if (isOwnerActiveAccount && showAllData && !isAccountPage) {
        usernameColor = 'accent2';
    } else if (ensName || isOwnerActiveAccount) {
        usernameColor = 'accent1';
    } else {
        usernameColor = 'text1';
    };

    // fn to handle a click on the wallet value in the DOM
    function handleWalletClick(): void {
        if (!isAccountPage) {
            const accountUrl = `/${isOwnerActiveAccount ? 'account' : ownerId}`;
            window.open(accountUrl, '_blank');
        }
    };

    // fn to handle a click on the wallet value in the DOM
    function handleWalletCopy(): void {
        copy(ownerId);
        openSnackbar(`${ownerId} copied`, 'info');
    }

    // JSX to return with no tooltip (used if tx belongs to the user)
    const walletNoTooltip: JSX.Element = (
        <RowItem
            hover
            color={usernameColor}
            font={usernameColor === 'text1' ? 'roboto' : undefined}
            data-label='wallet'
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
        >
            {usernameForDOM}
        </RowItem>
    );

    // JSX to return with a tooltip (used if tx does NOT belong to the user)
    const walletWithTooltip: JSX.Element = (
        <RowItem
            data-label='wallet'
            style={ensName ? { textTransform: 'lowercase' } : undefined}
            width={width}
        >
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
                        style={{ width: '316px' }}
                        onClick={(event: MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        <Text
                            font='roboto'
                            onClick={handleWalletClick}
                            style={{ cursor: 'pointer' }}
                        >
                            {ownerId}
                        </Text>
                        <FiCopy
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={handleWalletCopy}
                        />

                        <FiExternalLink
                            style={{ cursor: 'pointer' }}
                            size={'12px'}
                            onClick={handleWalletClick}
                        />
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
                leaveDelay={0}
            >
                <Text
                    font={usernameColor === 'text1' ? 'roboto' : undefined}
                    color={usernameColor}
                >
                    {usernameForDOM}
                </Text>
            </TextOnlyTooltip>
        </RowItem>
    );

    // return proper JSX element based on whether user owns the tx
    return isOwnerActiveAccount ? walletWithTooltip : walletNoTooltip;
}