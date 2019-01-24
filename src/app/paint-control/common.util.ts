export function calcAngle(pointA: Point, pointB: Point, pointC: Point) {
    const a = calcSide(pointA, pointC);
    const b = calcSide(pointB, pointA);
    const c = calcSide(pointC, pointB);
    const cosa = (c * c + b * b - a * a) / (2 * b * c);
    return Math.acos(cosa) * (180 / Math.PI);
}

export function calcSide(pointA: Point, pointB: Point) {
    return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
}

export function getSideOfLine(pointA: Point, pointB: Point, pointCheck: Point) {
    const d = (pointCheck.x - pointA.x) * (pointB.y - pointA.y) - (pointCheck.y - pointA.y) * (pointB.x - pointA.x);
    return d;
}

export function getPointAfterTransform(svg, matrix, point: Point) {
    const offset = svg.getBoundingClientRect();
    return new Point((matrix.a * point.x) + (matrix.c * point.y) + matrix.e - offset.left,
        (matrix.b * point.x) + (matrix.d * point.y) + matrix.f - offset.top);
}

export class Size {
    width: number;
    height: number;
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
