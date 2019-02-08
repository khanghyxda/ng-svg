export function calcAngle(pointA, pointB, pointC) {
    const a = calcSide(pointA, pointC);
    const b = calcSide(pointB, pointA);
    const c = calcSide(pointC, pointB);
    const cosa = (c * c + b * b - a * a) / (2 * b * c);
    return Math.acos(cosa) * (180 / Math.PI);
}

export function calcSide(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
}

export function getSideOfLine(pointA, pointB, pointCheck) {
    const d = (pointCheck.x - pointA.x) * (pointB.y - pointA.y) - (pointCheck.y - pointA.y) * (pointB.x - pointA.x);
    return d;
}

export function getPointAfterTransform(svg, matrix, point) {
    const offset = svg.getBoundingClientRect();
    return new Point((matrix.a * point.x) + (matrix.c * point.y) + matrix.e - offset.left,
        (matrix.b * point.x) + (matrix.d * point.y) + matrix.f - offset.top);
}

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    x: number;
    y: number;
}

export enum PaintObjectType {
    text,
    image
}

export function getTemplate(id) {
    const designTemplates: any[] = parseLocalStorage('designTemplates', []);
    return designTemplates.filter((o) => o.id = id)[0];
}

export function blobToUrl(blob) {
    return URL.createObjectURL(blob);
}

export async function urlToBase64(url) {
    try {
        const fetchData = await fetch(url);
        const dataBlob = await fetchData.blob();
        const reader = new FileReader();
        reader.readAsDataURL(dataBlob);
        const result = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
        return result;
    } catch (error) {
        throw (error);
    }
}

export async function urlToBlob(url) {
    try {
        const fetchData = await fetch(url);
        const dataBlob = await fetchData.blob();
        return dataBlob;
    } catch (error) {
        throw (error);
    }
}

export function parseLocalStorage(value, defaultValue) {
    try {
        const storageString = localStorage.getItem(value);
        if (storageString === undefined || storageString == null || storageString === '') {
            return defaultValue;
        }
        return JSON.parse(localStorage.getItem(value));
    } catch (error) {
        return defaultValue;
    }
}

export function calcInitImage(originWidthPx, originHeightPx, dpi, template) {
    const ratioTemplate = template.paintWidth / template.paintWidthIn;
    const resizeWidthIn = originWidthPx / dpi;
    const resizeHeightIn = originHeightPx / dpi;
    const resizeWidthPx = resizeWidthIn * ratioTemplate;
    const resizeHeightPx = resizeHeightIn * ratioTemplate;
    return { resizeWidthIn: resizeWidthIn, resizeHeightIn: resizeHeightIn, resizeWidthPx: resizeWidthPx, resizeHeightPx: resizeHeightPx };
}

export function calcDpi(originWidthPx, resizeWidthPx, template) {
    const ratioTemplate = template.paintWidth / template.paintWidthIn;
    const resizeWidthIn = resizeWidthPx / ratioTemplate;
    const dpi = originWidthPx / resizeWidthIn;
    return dpi;
}

export function makeId() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
