export const oneDecimal = (value: number) => {
    return parseFloat(Math.round(value).toFixed(1));
}