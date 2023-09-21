import React, { useState } from 'react';
import styled from 'styled-components';

interface MultiContentComponentProps {
    mainContent: React.ReactNode;
    settingsContent: React.ReactNode;
    confirmationContent: React.ReactNode;
}

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonWrapper = styled.div`
    display: flex;
`;

const Button = styled.button`
    margin-right: 10px;
`;

interface ContentProps {
    active: boolean;
}

const Content = styled.div<ContentProps>`
    display: ${(props) => (props.active ? 'block' : 'none')};
`;

const MultiContentComponent: React.FC<MultiContentComponentProps> = ({
    mainContent,
    settingsContent,
    confirmationContent,
}) => {
    const [activeContent, setActiveContent] = useState('main');

    return (
        <ContentWrapper>
            <ButtonWrapper>
                <Button onClick={() => setActiveContent('main')}>
                    Main Content
                </Button>
                <Button onClick={() => setActiveContent('settings')}>
                    Settings Content
                </Button>
                <Button onClick={() => setActiveContent('confirmation')}>
                    Confirmation Content
                </Button>
            </ButtonWrapper>
            <Content active={activeContent === 'main'}>{mainContent}</Content>
            <Content active={activeContent === 'settings'}>
                {settingsContent}
            </Content>
            <Content active={activeContent === 'confirmation'}>
                {confirmationContent}
            </Content>
        </ContentWrapper>
    );
};

export default MultiContentComponent;
