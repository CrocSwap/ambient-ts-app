import React from 'react';
import styled, { css } from 'styled-components/macro';
import { FlexContainer, Text } from '../../styled/Common';
import styles from '../../components/Home/Landing/BackgroundImages.module.css';

import { MdArrowBackIosNew } from 'react-icons/md';

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

const InnerContainer = styled.div<InnerContainerProps>`
    height: 100%;
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
    const { children, isConfirmation, setActiveContent, title, activeContent } =
        props;

    function handleBack() {
        if (activeContent === 'confirmation') {
            setActiveContent('main');
        } else return;
    }

    return (
        <FlexContainer
            width='100vw'
            height='100vh'
            justifyContent='center'
            alignItems='flex-start'
            className={styles.background}
        >
            <FlexContainer
                background='dark1'
                rounded
                padding='16px'
                textAlign='center'
                flexDirection='column'
                outline='accent1'
                tablet={{ margin: '64px 0 0 0' }}
                style={{ height: '462px' }}
            >
                <FlexContainer
                    rounded
                    background='dark1'
                    position='relative'
                    style={{ height: '100%' }}
                    transition
                    flexDirection='column'
                >
                    <FlexContainer height='41px' alignItems='center'>
                        <MdArrowBackIosNew
                            style={{ cursor: 'pointer' }}
                            onClick={handleBack}
                        />
                        <Text
                            fontSize='header1'
                            margin='auto'
                            fontWeight={'200'}
                        >
                            {title}
                        </Text>
                        {/* <FlexContainer
                            gap={8}
                            alignItems='center'
                            fontSize='header1'
                        >
                            {showSettings ? (
                                <SettingsSvg
                                    onClick={() => setActiveContent('settings')}
                                />
                            ) : (
                                <p />
                            )}
                            <IoIosCheckmarkCircle
                                onClick={() => setActiveContent('confirmation')}
                            />
                        </FlexContainer> */}
                    </FlexContainer>
                    <InnerContainer isConfirmation={isConfirmation}>
                        {children}
                    </InnerContainer>
                </FlexContainer>
            </FlexContainer>
        </FlexContainer>
    );
}
