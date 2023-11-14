import { Dispatch, RefObject, SetStateAction } from 'react';
import ReceiptDisplay from '../ReceiptDisplay/ReceiptDisplay';

import {
    useAppDispatch,
    useAppSelector,
} from '../../../../utils/hooks/reduxToolkit';
import { resetReceiptData } from '../../../../utils/state/receiptDataSlice';
import {
    Container,
    Content,
    FooterButton,
    Header,
    MainContainer,
} from './NotificationTable.styles';
import { FlexContainer } from '../../../../styled/Common';

interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
    pendingTransactions: string[];
    notificationItemRef: RefObject<HTMLDivElement>;
}

const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable, pendingTransactions, notificationItemRef } =
        props;

    const dispatch = useAppDispatch();

    const receiptData = useAppSelector((state) => state.receiptData);

    const transactionsByType = receiptData.transactionsByType;

    const parsedReceipts = receiptData.sessionReceipts.map((receipt) =>
        JSON.parse(receipt),
    );

    const successfulTransactions = parsedReceipts.filter(
        (receipt) => receipt?.status === 1,
    );

    const failedTransactions = parsedReceipts.filter(
        (receipt) => receipt?.status === 0,
    );

    const successfulTransactionsDisplay = successfulTransactions.map(
        (tx, idx) => (
            <ReceiptDisplay
                key={idx}
                status='successful'
                hash={tx?.transactionHash}
                txBlockNumber={tx.blockNumber}
                txType={
                    transactionsByType.find(
                        (e) => e.txHash === tx?.transactionHash,
                    )?.txDescription
                }
            />
        ),
    );
    const failedTransactionsDisplay = failedTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='failed'
            hash={tx?.transactionHash}
            txBlockNumber={tx.blockNumber}
            txType={
                transactionsByType.find((e) => e.txHash === tx?.transactionHash)
                    ?.txDescription
            }
        />
    ));
    const pendingTransactionsDisplay = pendingTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='pending'
            hash={tx}
            txType={
                transactionsByType.find((e) => e.txHash === tx)?.txDescription
            }
        />
    ));

    if (!showNotificationTable) return null;
    return (
        <MainContainer>
            <Container
                flexDirection='column'
                justifyContent='space-between'
                fullWidth
                background='dark1'
                ref={notificationItemRef}
            >
                <Header>Recent Transactions</Header>

                <Content flexDirection='column' gap={8}>
                    {pendingTransactionsDisplay}
                    {failedTransactionsDisplay}
                    {successfulTransactionsDisplay}
                </Content>

                <FlexContainer justifyContent='center'>
                    <FooterButton
                        onClick={() => {
                            dispatch(resetReceiptData());
                        }}
                        aria-label='Clear all'
                    >
                        Clear all
                    </FooterButton>
                </FlexContainer>
            </Container>
        </MainContainer>
    );
};

export default NotificationTable;
