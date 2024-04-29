function checkPass(){
    var password = document.getElementById('password').value;
    var retype = document.getElementById('retype').value;
    var error = document.getElementById('retype_error');
    if(retype != password) {
        error.innerHTML= "Retype password does not match. Check again!";
        return false;
    } else {
        error.innerHTML="";
        return true;
    }
}

function validateLoginInput (req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
        // If either field is missing, return an error message
        return res.status(400).render('auth/login', { error: 'Username and password are required' });
    }

    // Optionally sanitize input to prevent injection attacks
    req.body.username = String(username).trim();
    req.body.password = String(password).trim();

    next(); // Proceed to the next middleware or route handler
}

