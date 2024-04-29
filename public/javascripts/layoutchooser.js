app.use((req, res, next) => {
    switch (req.session.userRole) {
        case 'admin':
            res.locals.layout = 'adminLayout';
            break;
        case 'coach':
            res.locals.layout = 'coachLayout';
            break;
        default: // 'guest' or any other role
            res.locals.layout = 'studentLayout';
            break;
    }
    next();
});
