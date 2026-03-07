import jwt from "jsonwebtoken"
const isAuth=async (req,res,next)=>{
    try {
        const authHeader = req.headers.authorization || ""
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
        const token=req.cookies.token || bearerToken
        if(!token){
            return res.status(401).json({message:"token not found"})
        }
        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)
        req.userId=verifyToken.userId

        next()

    } catch (error) {
        console.log(error)
        return res.status(401).json({message:"invalid or expired token"})
    }
}

export default isAuth
