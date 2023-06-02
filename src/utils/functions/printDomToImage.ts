import { domToPng } from 'modern-screenshot';

const saveAs = async (uri: string, filename: string) => {
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;

        // Firefox requires the link to be in the body
        document.body.appendChild(link);

        // simulate click
        link.click();
        // remove the link when done
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
};

const printDomToImage = (
    node: HTMLElement,
    background?: string,
    additionalStyles?: Partial<CSSStyleDeclaration>,
) => {
    const scale = 2;
    const photoName =
        'ambient-chart' + new Date().toLocaleString().replace(/\s/g, '');

    domToPng(node, {
        height: node.offsetHeight * scale,
        width: node.offsetWidth * scale,
        backgroundColor: background,
        style: {
            transform: 'scale(' + scale + ')',
            transformOrigin: 'top left',
            width: node.offsetWidth + 'px',
            height: node.offsetHeight + 'px',
            ...additionalStyles,
        },
    })
        // eslint-disable-next-line
        .then(function (dataUrl: any) {
            const img = new Image();
            img.src = dataUrl;
            saveAs(dataUrl, photoName);
        })
        // eslint-disable-next-line
        .catch(function (error: any) {
            console.error('oops, something went wrong!', error);
        });
};

export default printDomToImage;
