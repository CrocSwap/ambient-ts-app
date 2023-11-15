import React from 'react';
import { ExplanationButton } from './Icons.styles'; // Make sure to import it correctly
import { AiOutlineInfoCircle } from 'react-icons/ai';

const ExplanationIcon = () => {
    return (
        <ExplanationButton>
            {' '}
            <AiOutlineInfoCircle color='var(--text2)' />
        </ExplanationButton>
    );
};

export default ExplanationIcon;
