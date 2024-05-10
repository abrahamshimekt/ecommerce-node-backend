const jwt  = require( 'jsonwebtoken');
// ensures that the request is made by an authenticated user.
const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
       
        jwt.verify(token, process.env.SECRET_KEY,(error,user)=>{
            if(error) res.status(403).json("Token is not valid");
            req.user = user;
            next();
        })
    } else{
        res.status(401).json('You are not authenticated');
    }

}
// additionally checks if the authenticated user is authorized to perform a specific action based on their ID or admin status.
const verifyTokenAndAuth = (req,res,next)=>{
    verifyToken(req,res,()=>{
        if( req.user.id === req.params.id||req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You are not allowed to do this");
        }
    })
}

// specifically checks if the authenticated user is an admin.
const verifyTokenAndAdmin = (req,res,next)=>{
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next();
        } else{
            res.status(403).json('You are not allowed to do this');
        }
    })

    

}

module.exports = {verifyToken,verifyTokenAndAuth,verifyTokenAndAdmin};
