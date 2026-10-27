const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

module.exports = {
  origin(origin, callback) {
    // Native apps and server clients may send no Origin header.
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
    callback(null, !origin || isLocal || configuredOrigins.includes(origin));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  // Bearer tokens are supported without credentialed cookies.
};
