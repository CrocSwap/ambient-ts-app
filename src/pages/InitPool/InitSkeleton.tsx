import React, { Dispatch, SetStateAction } from 'react';
import styled, { css } from 'styled-components/macro';

interface InitSkeletonProps {
    children: React.ReactNode;
    isConfirmation: boolean;
    currentStep: number;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    title: string;
}
interface InnerContainerProps {
    isConfirmation: boolean;
}
const Main = styled.section`
    height: calc(100vh - 4rem);
    overflow: hidden;

    background: url('../../assets/images/backgrounds/background.png') no-repeat
        center center fixed;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    cursor: default;

    width: 100vw;

    display: flex;
    justify-content: center;

    & header {
        height: 41px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: var(--header1-size);
        line-height: var(--header1-lh);
        font-weight: 200;
        color: var(--text1);
    }
`;

const OuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const GradientContainer = styled.div`
    background: var(--title-gradient);
    padding: 1px;
    border-radius: var(--border-radius);

    @media only screen and (min-width: 768px) {
        margin-top: 64px;
    }
`;
const MainContainer = styled.div`
    background: var(--dark1);
    border-radius: var(--border-radius);
    padding: 1rem;

    header {
        height: 41px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: var(--header1-size);
        line-height: var(--header1-lh);
        font-weight: 200;
        color: var(--text1);
    }
`;

const InnerContainer = styled.div<InnerContainerProps>`
    ${(props) =>
        props.isConfirmation
            ? css`
                  display: flex;
              `
            : css`
                  display: grid;
                  grid-template-columns: 1fr 1fr;
              `}

    @media only screen and (min-width: 768px) {
        width: 772px;
    }
`;

export default function InitSkeleton(props: InitSkeletonProps) {
    const { children, isConfirmation, currentStep, setCurrentStep, title } =
        props;

    return (
        <Main>
            <OuterContainer>
                <GradientContainer>
                    <MainContainer>
                        <header onClick={() => setCurrentStep(currentStep + 1)}>
                            <p />
                            {title}
                            <p />
                        </header>

                        <InnerContainer isConfirmation={isConfirmation}>
                            {children}
                        </InnerContainer>
                    </MainContainer>
                </GradientContainer>
            </OuterContainer>
        </Main>
    );
}
