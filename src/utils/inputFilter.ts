export default function inputFilter(str: string) {
  return str
    .replace(/^0+(?=[^.0-9]|$)/, (match) => (match.length > 1 ? "0" : match))
    .replace(/^(\.)+/, "0.")
    .replace(/(?<=\..*)\./g, "")
    .replace(/^0+(?=\d)/, "")
    .replace(/[^\d.]/g, "");
}
