import React from 'react';
import { brand } from '../../ambient-utils/constants';
import styles from './Button.module.css';

interface propsIF {
    idForDOM: string;
    disabled?: boolean;
    warning?: boolean;
    title: string | React.ReactNode;
    action: () => void;
    flat?: boolean;
    customAriaLabel?: string;
    thin?: boolean;
    black?: boolean;
    width?: string;
    style?: React.CSSProperties;
}

export default function Button(props: propsIF) {
    const {
        idForDOM,
        disabled,
        warning,
        action,
        title,
        flat,
        customAriaLabel,
        // width,
        style,
        thin,
    } = props;
    const isFuta = brand === 'futa';

    const ariaLabelToDisplay = disabled
        ? `Button is disabled. ${title}`
        : customAriaLabel
          ? customAriaLabel
          : '';

    const buttonClasses = [
        styles.button,
        flat ? styles.flat : styles.gradient,
        disabled && styles.disabled,
        warning && styles.warning,
        isFuta && styles.isFuta,
        isFuta && disabled && styles.isFutaDisabled,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            id={idForDOM}
            style={{
                ...(thin
                    ? {
                          height: '28px',
                          width: '156px',
                          padding: 0,
                      }
                    : {}),
                ...style, // Merge with style prop
            }}
            onClick={action}
            disabled={disabled}
            aria-label={ariaLabelToDisplay}
            tabIndex={0}
            className={buttonClasses}
        >
            {title}
        </button>
    );
}
