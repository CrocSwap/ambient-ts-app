import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

interface Page {
    title: string;
    content: string;
    background?: string;
}

const pages: Page[] = [
    { title: 'Page 1', content: 'Content for page 1', background: 'yellow' },
    { title: 'Page 2', content: 'Content for page 2', background: 'red' },
    { title: 'Page 3', content: 'Content for page 3', background: 'green' },
    { title: 'Page 4', content: 'Content for page 4', background: 'blue' },
    { title: 'Page 5', content: 'Content for page 5' },
    { title: 'Page 6', content: 'Content for page 6' },
];

const VerticalSlider: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(pages[0]);

    useEffect(() => {
        const interval = setInterval(() => {
            const currentIndex = pages.indexOf(currentPage);
            setCurrentPage(
                currentIndex === pages.length - 1
                    ? pages[0]
                    : pages[currentIndex + 1],
            );
        }, 3000);

        return () => clearInterval(interval);
    }, [currentPage]);

    const nextPage = () => {
        const currentIndex = pages.indexOf(currentPage);
        setCurrentPage(
            currentIndex === pages.length - 1
                ? pages[0]
                : pages[currentIndex + 1],
        );
    };

    const prevPage = () => {
        const currentIndex = pages.indexOf(currentPage);
        setCurrentPage(
            currentIndex === 0
                ? pages[pages.length - 1]
                : pages[currentIndex - 1],
        );
    };

    return (
        <AnimatePresence exitBeforeEnter>
            <SliderContainer>
                {pages.map((page) => (
                    <Slide
                        key={page.title}
                        active={page.title === currentPage.title}
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 0.5 }}
                        background={page.background}
                    >
                        <h1>{page.title}</h1>
                        <p>{page.content}</p>
                    </Slide>
                ))}
                <PrevButton onClick={prevPage}>Prev</PrevButton>
                <NextButton onClick={nextPage}>Next</NextButton>
            </SliderContainer>
        </AnimatePresence>
    );
};

const SliderContainer = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
`;

const Slide = styled(motion.div)<{ active: boolean; background?: string }>`
    width: 100%;
    height: ${(props) => (props.active ? '100%' : '0')};
    overflow: hidden;
    display: ${(props) => (props.active ? 'flex' : 'none')};
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    background: ${(props) => props.background};
`;

const Button = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    padding: 10px 20px;
    border: none;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
`;

const PrevButton = styled(Button)`
    left: 10px;
`;

const NextButton = styled(Button)`
    right: 10px;
`;

export default VerticalSlider;
