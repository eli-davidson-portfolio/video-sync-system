// src/worker.js
/* eslint-disable no-restricted-globals */

function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}
self.onmessage = function (e) {
  const number = e.data;
  const result = factorial(number);
  self.postMessage(result);
};