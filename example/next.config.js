module.exports = {
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};
