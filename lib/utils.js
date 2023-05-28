export function length(vec) {
  return Math.sqrt(vec.reduce((p, c) => p + Math.pow(c, 2), 0));
}
