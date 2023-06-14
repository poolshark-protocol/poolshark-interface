import JSBD, { Decimal } from "jsbd";

export function priceToString(price: Decimal): string {
    if (scale(price) < 3) return Number.parseFloat(price.toPrecision(5)).toString()
    return Number.parseFloat(price.toPrecision(6)).toString()
}

export function scale(price: JSBD): number {
    let stringArr = price.toString().split('.')
    return stringArr[0].length
}

export function precision(price: JSBD): number {
    let stringArr = price.toString().split('.')
    return stringArr[1].length
}