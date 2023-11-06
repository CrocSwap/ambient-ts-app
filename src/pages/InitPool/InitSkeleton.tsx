import React from 'react';
import styled, { css } from 'styled-components/macro';
import { FlexContainer, Text } from '../../styled/Common';
import styles from '../../components/Home/Landing/BackgroundImages.module.css';

import { MdArrowBackIosNew } from 'react-icons/md';
import { FiSettings } from 'react-icons/fi';
import { DISABLE_INIT_SETTINGS } from '../../constants';

interface InitSkeletonProps {
    children: React.ReactNode;
    isConfirmation: boolean;
    activeContent: string;
    setActiveContent: (key: string) => void;
    title: string;
    isTokenModalOpen: boolean;
    handleGoBack: () => void;
}
interface InnerContainerProps {
    isConfirmation: boolean;
}

const InnerContainer = styled.div<InnerContainerProps>`
    height: 70vh;
    overflow-y: scroll;
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
        height: 100%;
        overflow-y: hidden;
    }
`;

export default function InitSkeleton(props: InitSkeletonProps) {
    const {
        children,
        isConfirmation,
        title,
        handleGoBack,
        setActiveContent,
        activeContent,
    } = props;

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
                padding='8px 16px 16px 16px'
                textAlign='center'
                flexDirection='column'
                outline='accent1'
                boxShadow='gradient'
                height='462px'
                md={{ margin: '64px 0 0 0' }}
                className='mobile_auto_height'
            >
                <FlexContainer
                    rounded
                    position='relative'
                    style={{ height: '100%' }}
                    transition
                    flexDirection='column'
                >
                    <FlexContainer height='41px' alignItems='center'>
                        <MdArrowBackIosNew
                            style={{ cursor: 'pointer' }}
                            onClick={handleGoBack}
                        />
                        <Text
                            fontSize='header1'
                            margin='auto'
                            fontWeight={'200'}
                        >
                            {title}
                        </Text>
                        {!DISABLE_INIT_SETTINGS && activeContent === 'main' && (
                            <FiSettings
                                onClick={() => setActiveContent('settings')}
                                size={18}
                            />
                        )}
                    </FlexContainer>
                    <InnerContainer isConfirmation={isConfirmation}>
                        {children}
                    </InnerContainer>
                </FlexContainer>
            </FlexContainer>
        </FlexContainer>
    );
}
