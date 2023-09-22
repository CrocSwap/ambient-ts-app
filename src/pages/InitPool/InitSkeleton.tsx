import React from 'react';
import styled, { css } from 'styled-components/macro';
import { HoverableIcon } from '../../styled/Components/TradeModules';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { FlexContainer } from '../../styled/Common';

interface InitSkeletonProps {
    children: React.ReactNode;
    isConfirmation: boolean;
    activeContent: string;
    setActiveContent: (key: string) => void;
    title: string;
    isTokenModalOpen: boolean;
}
interface InnerContainerProps {
    isConfirmation: boolean;
}

interface MainContainerProps {
    isTokenModalOpen: boolean;
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
const MainContainer = styled.div<MainContainerProps>`
    background: var(--dark1);

    border-radius: var(--border-radius);
    position: relative;
    padding: 1rem;
    transition: all var(--animation-speed) ease-in-out;

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
                  @media only screen and (min-width: 768px) {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 1rem;
                  }
              `}

    @media only screen and (min-width: 768px) {
        width: 772px;
    }
`;

export default function InitSkeleton(props: InitSkeletonProps) {
    const {
        children,
        isConfirmation,
        isTokenModalOpen,
        setActiveContent,
        title,
    } = props;

    const settingsSvg = (
        <HoverableIcon
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            onClick={() => setActiveContent('settings')}
        >
            <rect
                y='9.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <rect
                x='5.25'
                y='2.625'
                width='8.75'
                height='1.75'
                rx='0.875'
                fill=''
            ></rect>
            <circle cx='12.25' cy='10.5' r='1.75' fill=''></circle>
            <circle cx='1.75' cy='3.5' r='1.75' fill=''></circle>
        </HoverableIcon>
    );

    const showSettings = title === 'Initialize Pool';

    return (
        <Main>
            <OuterContainer>
                <GradientContainer>
                    <MainContainer isTokenModalOpen={isTokenModalOpen}>
                        <header>
                            <p />

                            {title}

                            <FlexContainer gap={8} alignItems='center'>
                                {showSettings ? settingsSvg : <p />}
                                <IoIosCheckmarkCircle
                                    onClick={() =>
                                        setActiveContent('confirmation')
                                    }
                                />
                            </FlexContainer>
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
