import React from 'react';
import { motion, Transition, SVGMotionProps } from 'framer-motion';

// eslint-disable-next-line
export interface Props extends SVGMotionProps<any> {
    isOpen?: boolean;
    color?: string;
    strokeWidth?: string | number;
    // eslint-disable-next-line
    transition?: Transition | any;
    // eslint-disable-next-line
    lineProps?: any;

    width: number | string;
    height: number | string;
}

const MenuButton = ({
    isOpen = false,
    width = 24,
    height = 24,
    strokeWidth = 1,
    color = '#000',
    transition = null,
    lineProps = null,
    ...props
}: Props) => {
    const variant = isOpen ? 'opened' : 'closed';
    const top = {
        closed: {
            rotate: 0,
            translateY: 0,
        },
        opened: {
            rotate: 45,
            translateY: 2,
        },
    };
    const center = {
        closed: {
            opacity: 1,
        },
        opened: {
            opacity: 0,
        },
    };
    const bottom = {
        closed: {
            rotate: 0,
            translateY: 0,
        },
        opened: {
            rotate: -45,
            translateY: -2,
        },
    };
    lineProps = {
        stroke: color,
        strokeWidth: strokeWidth as number,
        vectorEffect: 'non-scaling-stroke',
        initial: 'closed',
        animate: variant,
        transition,
        ...lineProps,
    };
    const unitHeight = 4;
    const unitWidth = (unitHeight * (width as number)) / (height as number);

    return (
        <motion.svg
            viewBox={`0 0 ${unitWidth} ${unitHeight}`}
            overflow='visible'
            preserveAspectRatio='none'
            width={width}
            height={height}
            {...props}
        >
            <motion.line x1='0' x2={unitWidth} y1='0' y2='0' variants={top} {...lineProps} />
            <motion.line x1='0' x2={unitWidth} y1='2' y2='2' variants={center} {...lineProps} />
            <motion.line x1='0' x2={unitWidth} y1='4' y2='4' variants={bottom} {...lineProps} />
        </motion.svg>
    );
};

export { MenuButton };
