export function createRectLabel(
    context: any,
    y: number,
    x: number,
    color: string,
    textColor: string,
    text: string,
    stroke: string | undefined = undefined,
    yAxisWidth: any = 70,
    subString: number | undefined = undefined,
) {
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(0, y - 10, yAxisWidth + yAxisWidth / 2, 20);
    context.fillStyle = textColor;
    context.fontSize = '13';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.letterSpacing = 'normal';
    if (subString) {
        context.letterSpacing = '1px';
        const textHeight =
            context.measureText('0.0').actualBoundingBoxAscent +
            context.measureText('0.0').actualBoundingBoxDescent;

        context.fillText(
            '0.0',
            x -
                context.measureText('0.0').width / 2 -
                context.measureText(subString).width / 2,
            y,
        );
        context.fillText(subString, x, y + textHeight / 3);
        context.fillText(
            text,
            x +
                context.measureText('0.0').width / 2 +
                context.measureText(subString).width / 2,
            y,
        );
    } else {
        context.fillText(text, x, y + 2);
    }

    if (stroke !== undefined) {
        context.strokeStyle = stroke;
        context.strokeRect(1, y - 10, yAxisWidth + yAxisWidth / 2, 20);
    }
}
