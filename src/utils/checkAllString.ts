export default function checkAllString(...args: any[]) {
  for (const arg in args) {
    if (typeof arg !== "string") {
      console.log(arg, "Not a string!");
      return false;
    }
  }
  return true;
}
