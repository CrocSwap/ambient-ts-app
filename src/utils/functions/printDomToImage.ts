import { domToBlob } from 'modern-screenshot';

const printDomToImage = async (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
    cutOff?: number,
) => {
    const scale = 2;

    try {
        const blob = await domToBlob(node, {
            height: (node.offsetHeight - (cutOff ? cutOff : 0)) * scale,
            width: node.offsetWidth * scale,
            backgroundColor: background,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
                width: node.offsetWidth + 'px',
                height: node.offsetHeight + 'px',
                ...additionalStyles,
            },
        });
        return blob;
    } catch (e) {
        console.error('oops, something went wrong!', e);
    }
};

export default printDomToImage;
