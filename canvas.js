const go = (f) => {
    const BORDER = 5;
    const ELEMENT_WIDTH = 10;

    const context = (document) => {
        const canvas = document.getElementsByTagName('canvas')[0];
        canvas.height = canvas.clientHeight;
        canvas.width = canvas.clientWidth;
        const context = canvas.getContext('2d');

        context.beginPath();
        context.moveTo(canvas.width - BORDER - ELEMENT_WIDTH, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH/2, canvas.height - BORDER);
        context.lineTo(canvas.width - BORDER, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH/2, canvas.height - BORDER - ELEMENT_WIDTH);
        context.lineTo(canvas.width - BORDER - ELEMENT_WIDTH, canvas.height - BORDER - ELEMENT_WIDTH/2);
        context.stroke();

        return context;
    }

    f(context(document));
}