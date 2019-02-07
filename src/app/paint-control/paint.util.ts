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
    const designTemplates: any[] = JSON.parse(localStorage.getItem('designTemplates'));
    return designTemplates.filter((o) => o.id = id)[0];
}
