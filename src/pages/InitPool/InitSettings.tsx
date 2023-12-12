import styled from 'styled-components/macro';
import { Dispatch, SetStateAction } from 'react';
import { FlexContainer, Text } from '../../styled/Common';
import InitSkeleton from './InitSkeleton';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
import Toggle from '../../components/Form/Toggle';

const Wrapper = styled.div`
    border-radius: 8px;
    padding: 24px;
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

interface InitSettingsProps {
    activeContent: string;
    setActiveContent: (key: string) => void;

    handleGoBack: () => void;
    isTokenModalOpen: boolean;
    isLpContractCreationEnabled: boolean;
    setIsLpContractCreationEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function InitSettings(props: InitSettingsProps) {
    const {
        activeContent,
        setActiveContent,
        handleGoBack,
        isTokenModalOpen,
        isLpContractCreationEnabled,
        setIsLpContractCreationEnabled,
    } = props;

    return (
        <InitSkeleton
            isTokenModalOpen={isTokenModalOpen}
            handleGoBack={handleGoBack}
            isConfirmation={true}
            activeContent={activeContent}
            setActiveContent={setActiveContent}
            title='Settings'
        >
            <Wrapper>
                <FlexContainer
                    flexDirection='row'
                    alignItems='center'
                    justifyContent='space-between'
                    gap={8}
                    width='100%'
                >
                    <FlexContainer gap={8}>
                        <Text fontSize='body' color='text2'>
                            Initialize LP token contract
                        </Text>

                        <TooltipComponent title='A one-time contract creation transaction to initialize a liquidity position token contract' />
                    </FlexContainer>

                    <Toggle
                        id='toggle_ref_price'
                        isOn={isLpContractCreationEnabled}
                        disabled={false}
                        handleToggle={() =>
                            setIsLpContractCreationEnabled(
                                !isLpContractCreationEnabled,
                            )
                        }
                    />
                </FlexContainer>
            </Wrapper>
        </InitSkeleton>
    );
}
