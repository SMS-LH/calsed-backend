const errorHandler = (err, req, res, next) => {
  // Si le status code est 200 (OK) mais qu'il y a une erreur, on met 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  res.json({
    message: err.message,
    // On n'affiche la pile d'erreurs (stack) qu'en mode développement
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { errorHandler };