import {
  getRandomQuote,
  getDailyQuote,
  getSupportedLanguages
} from "quotiva";

console.log("Random:");
console.log(getRandomQuote());

console.log("\nDaily Arabic:");
console.log(getDailyQuote({ language: "ar" }));

console.log("\nLanguages:");
console.log(getSupportedLanguages());