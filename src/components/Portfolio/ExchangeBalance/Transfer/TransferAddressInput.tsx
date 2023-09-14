import { Dispatch, SetStateAction } from 'react';
import { FlexContainer, Text } from '../../../../styled/Common';
import { CurrencyQuantityInput } from '../../../../styled/Components/Portfolio';

interface TransferAddressInputProps {
    fieldId: string;
    setTransferToAddress: Dispatch<SetStateAction<string | undefined>>;
    disable?: boolean;
    sendToAddress: string | undefined;
}

export default function TransferAddressInput(props: TransferAddressInputProps) {
    const { fieldId, disable, sendToAddress, setTransferToAddress } = props;

    const rateInput = (
        <CurrencyQuantityInput
            id={`${fieldId}-exchange-balance-transfer-quantity`}
            placeholder='Enter Address or ENS ... '
            onChange={(event: { target: { value: string } }) => {
                const value = event.target.value;
                if (value && !value.includes('.') && !value.startsWith('0x')) {
                    setTransferToAddress('0x' + event.target.value);
                } else {
                    setTransferToAddress(value);
                }
            }}
            defaultValue={sendToAddress ? sendToAddress : undefined}
            type='string'
            inputMode='text'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            disabled={disable}
        />
    );

    return (
        <FlexContainer
            overflow='auto'
            flexDirection='column'
            overflowY='hidden'
            color='white'
        >
            <Text
                fontWeight='300'
                margin='0 0 4px 0'
                fontSize='body'
                color='text1'
            >
                To
            </Text>
            <FlexContainer
                rounded
                background='dark2'
                justifyContent='space-between'
                alignItems='center'
                minHeight='40px'
            >
                <div style={{ width: '100%' }}>{rateInput}</div>
            </FlexContainer>
            <Text
                style={{ overflow: 'hidden' }}
                fontSize='body'
                color='text2'
                padding='4px'
                margin='0 8px'
                font='mono'
            >
                {sendToAddress && sendToAddress.length > 30
                    ? sendToAddress
                    : undefined}
            </Text>
        </FlexContainer>
    );
}
