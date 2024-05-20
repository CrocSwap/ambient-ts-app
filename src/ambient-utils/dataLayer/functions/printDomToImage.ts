import { domToBlob } from 'modern-screenshot';

// export const printDomToImage = async (
//     node: HTMLElement,
//     background?: string,
//     additionalStyles?: Partial<CSSStyleDeclaration>,
//     height?: number,
// ) => {
//     const scale = 2;
//     try {
//         const blob = await domToBlob(node, {
//             height: (height || node.offsetHeight) * scale,
//             width: node.offsetWidth * scale,
//             backgroundColor: background,
//             style: {
//                 transform: 'scale(' + scale + ')',
//                 transformOrigin: 'top left',
//                 width: node.offsetWidth + 'px',
//                 height: node.offsetHeight + 'px',
//                 ...additionalStyles,
//             },
//         });
//         return blob;
//     } catch (e) {
//         console.error('oops, something went wrong!', e);
//     }
// };

export const printDomToImage = async (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
    height?: number,
    excludeSelectors?: string[],
) => {
    const scale = 2;
    try {
        // Clone the node
        const clonedNode = node.cloneNode(true) as HTMLElement;

        if (excludeSelectors) {
            excludeSelectors.forEach((selector) => {
                const elementsToExclude = clonedNode.querySelectorAll(selector);
                elementsToExclude.forEach((element) => {
                    (element as HTMLElement).style.display = 'none';
                });
            });
        }

        const blob = await domToBlob(clonedNode, {
            height: (height || clonedNode.offsetHeight) * scale,
            width: clonedNode.offsetWidth * scale,
            backgroundColor: background,
            style: {
                transform: 'scale(' + scale + ')',
                transformOrigin: 'top left',
                width: clonedNode.offsetWidth + 'px',
                height: clonedNode.offsetHeight + 'px',
                ...additionalStyles,
            },
        });
        return blob;
    } catch (e) {
        console.error('oops, something went wrong!', e);
    }
};
