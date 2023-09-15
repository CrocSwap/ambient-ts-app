import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styled from 'styled-components';

interface PagerProps {
    children: ReactNode;
    activeTab: number; // Change 'value' to 'activeTab'
}

const PagerAnimtedContainer = styled(motion.div)`
    flex-direction: row;
    direction: ltr;
    will-change: transform;
    min-height: 0;
    flex: 1;
    display: flex;
`;

const Page = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-self: stretch;
    justify-content: flex-start;
    flex-shrink: 0;
    height: 100%;
    overflow: hidden;
    outline: none;
`;

export function Pager({ children, activeTab }: PagerProps) {
    return (
        <PagerAnimtedContainer
            transition={{
                tension: 190,
                friction: 70,
                mass: 0.4,
            }}
            initial={false}
            animate={{ x: activeTab * -100 + '%' }} // Change 'value' to 'activeTab'
        >
            {React.Children.map(children, (child, i) => (
                <Page
                    key={i}
                    aria-hidden={activeTab !== i}
                    tabIndex={activeTab === i ? 0 : -1}
                >
                    {' '}
                    {/* Change 'value' to 'activeTab' */}
                    {child}
                </Page>
            ))}
        </PagerAnimtedContainer>
    );
}
