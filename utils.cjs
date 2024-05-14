// if user is register -> grant access 
const requireUser = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.sendStatus(401);
		}
}
	
// if user is admin -> grant access
const requireAdmin = (req, res, next) => {
	if (req.user?.is_admin) {
		next();
	} else {
		res.sendStatus(401);
	}
}

module.exports = {
	requireAdmin,
	requireUser
}