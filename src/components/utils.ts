function input2name(input: string, allowed: RegExp, join: string) {
  const name = `¶${input}`
    .toLowerCase()
    .split('')
    .map((char) => (allowed.test(char) ? char : '¶'))
    .join('')
    .split('')
    .reduce((p, n) => (p.charAt(p.length - 1) === '¶' && n === '¶' ? p : p + n))
    .slice(1)
    .replace(/¶/g, join);
  if (name.charAt(name.length - 1) === join) return name.slice(0, name.length - 1);
  return name;
}

export const title2name = (title: string) => input2name(title.replace(/&/g, '¶and¶'), /^[a-z0-9-]/, '-').slice(0, 50);
