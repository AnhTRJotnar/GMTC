const checkLoginSession = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

const checkAdminSession = (req, res, next) => {
    if (req.session.username && req.session.role == 'admin') {
        next();
    } else {
        res.redirect('/auth/login');
        return;
    }
}

const checkCoachSession = (req, res, next) => {
    if (req.session.username && req.session.role == 'coach') {
        next();
    } else {
        res.redirect('/auth/login');
        return;
    }
}

const checkStudentSession = (req, res, next) => {
    if (req.session.username && req.session.role == 'student') {
        next();
    } else {
        res.redirect('/auth/login');
        return;
    }
}

const checkMultipleSession = (allowedRoles) => (req, res, next) => {
    if (req.session.username && allowedRoles.includes(req.session.role)) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

module.exports = {
    checkLoginSession,
    checkAdminSession,
    checkCoachSession,
    checkStudentSession,
    checkMultipleSession
};