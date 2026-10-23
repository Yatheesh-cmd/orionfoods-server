const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Role '${req.user?.role}' is not authorized` });
    }
    next();
  };
};

module.exports = { authorize };