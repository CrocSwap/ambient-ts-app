import { ButtonBase } from './Form.styles';

interface propsIF {
    idForDOM: string;
    disabled?: boolean;
    title: string;
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
        action,
        title,
        flat,
        customAriaLabel,
        width,
        style,
        thin,
    } = props;

    const ariaLabelToDisplay = disabled
        ? `Button is disabled. ${title}`
        : customAriaLabel
        ? customAriaLabel
        : '';
    return (
        <ButtonBase
            id={idForDOM}
            style={{
                ...(thin ? { height: '28px', width: '156px', padding: 0 } : {}),
                ...style, // Merge with style prop
            }}
            onClick={action}
            disabled={disabled}
            aria-label={ariaLabelToDisplay}
            tabIndex={0}
            flat={!!flat}
            width={width ? width : thin ? '156px' : '100%'}
            height={thin ? '28px' : 'auto'}
        >
            {title}
        </ButtonBase>
    );
}
