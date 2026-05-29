const transliterationMap: Record<string, string> = {
  "\u0430": "a",
  "\u0431": "b",
  "\u0432": "v",
  "\u0433": "h",
  "\u0491": "g",
  "\u0434": "d",
  "\u0435": "e",
  "\u0454": "ie",
  "\u0436": "zh",
  "\u0437": "z",
  "\u0438": "y",
  "\u0456": "i",
  "\u0457": "i",
  "\u0439": "i",
  "\u043a": "k",
  "\u043b": "l",
  "\u043c": "m",
  "\u043d": "n",
  "\u043e": "o",
  "\u043f": "p",
  "\u0440": "r",
  "\u0441": "s",
  "\u0442": "t",
  "\u0443": "u",
  "\u0444": "f",
  "\u0445": "kh",
  "\u0446": "ts",
  "\u0447": "ch",
  "\u0448": "sh",
  "\u0449": "shch",
  "\u044c": "",
  "\u044e": "iu",
  "\u044f": "ia",
  "\u0451": "yo",
  "\u044b": "y",
  "\u044d": "e",
  "\u044a": "",
};

export function slugifyText(value: string, separator = "-") {
  const normalizedSeparator = separator === "_" ? "_" : "-";

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] ?? char)
    .join("")
    .replace(/['\u2019`]/g, "")
    .replace(/[^a-z0-9]+/g, normalizedSeparator)
    .replace(
      new RegExp(`^${normalizedSeparator}+|${normalizedSeparator}+$`, "g"),
      "",
    )
    .replace(
      new RegExp(`${normalizedSeparator}{2,}`, "g"),
      normalizedSeparator,
    );
}

export function fieldKeyFromLabel(value: string) {
  return slugifyText(value, "_");
}
