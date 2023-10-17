import styled from 'styled-components/macro';

import InitSkeleton from './InitSkeleton';
import { FlexContainer, Text } from '../../styled/Common';
import TooltipComponent from '../../components/Global/TooltipComponent/TooltipComponent';
import Toggle from '../../components/Form/Toggle';
import { useState } from 'react';

const Wrapper = styled.div`
    border-radius: 8px;
    padding: 24px;
    width: 50%;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
`;

interface InitSettingsProps {
    activeContent: string;
    setActiveContent: (key: string) => void;

    handleGoBack: () => void;
    isTokenModalOpen: boolean;
}

export default function InitSettings(props: InitSettingsProps) {
    const { activeContent, setActiveContent, handleGoBack, isTokenModalOpen } =
        props;
    const [isLp, setIsLp] = useState(false);
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
                            Enable LP Token Minting
                        </Text>

                        <TooltipComponent title='A one-time contract creation transaction to enable automatic token creation for all future liquidity positions.' />
                    </FlexContainer>

                    <Toggle
                        id='toggle_ref_price'
                        isOn={isLp}
                        disabled={false}
                        handleToggle={() => setIsLp(!isLp)}
                    />
                </FlexContainer>
            </Wrapper>
        </InitSkeleton>
    );
}
