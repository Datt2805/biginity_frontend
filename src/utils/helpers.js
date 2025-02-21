export function* loadingCharGenerator(chars) {
    let index = 0;
    while (true) {
      yield chars[index];
      index = (index + 1) % chars.length;
    }
  }
  