const browserAgentMiddleware = (req, res, next) => {
  const userAgent = req.headers["user-agent"];

  if (!userAgent) {
    return res.status(400).json({
      message: "User-Agent header is required",
    });
  }

  const browserKeywords = [
    "Mozilla",
    "Chrome",
    "Safari",
    "Opera",
    "Edg",
    "MSIE",
    "Trident",
    "Brave",
    "Vivaldi",
    "UCBrowser",
    "Maxthon",
    "YaBrowser",
    "PostmanRuntime/7.42.0",
  ];

  const isBrowser = browserKeywords.some((keyword) =>
    userAgent.includes(keyword)
  );

  if (!isBrowser) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  next();
};

export default browserAgentMiddleware;
