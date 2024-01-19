
const auth = (req , res , next) => {

    if(!req.session.loginId){

        res.redirect('/login');

        return;
    }

    next();

}

export = auth;