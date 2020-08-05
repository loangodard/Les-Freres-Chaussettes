exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found',isLoggedIn:req.session.isLoggedIn });
};

exports.get500 = (req,res,next) => {
  res.status(500).render('500', { pageTitle: 'Erreur',isLoggedIn:req.session.isLoggedIn });
}
