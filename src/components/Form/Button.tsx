import { ButtonBase } from './Form.styles';

interface propsIF {
    idForDOM: string;
    disabled?: boolean;
    warning?: boolean;
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
    const isSepolia = import.meta.env.VITE_BRAND_ASSET_SET === 'plumeSepolia';

    const {
        idForDOM,
        disabled,
        warning,
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
                ...(isSepolia
                    ? {
                          border: '3px solid #000',
                          boxShadow:
                              'inset 0 0 0 2px rgba(255, 255, 255, 0.86), 6px 5px #000',
                      }
                    : {}),
            }}
            onClick={action}
            disabled={disabled}
            aria-label={ariaLabelToDisplay}
            tabIndex={0}
            flat={!!flat}
            width={width ? width : thin ? '156px' : '100%'}
            height={thin ? '28px' : 'auto'}
            warning={warning}
        >
            {title}
        </ButtonBase>
    );
}
