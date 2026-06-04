module.exports = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (prop === '__esModule') return false;
      return String(prop);
    },
  },
);
