import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

const getCookieOptions = (req) => {
    const origin = req.headers.origin
    const requestHost = (req.headers.host || "").split(":")[0]
    let originHost = ""
    try {
        if (origin) {
            originHost = new URL(origin).hostname
        }
    } catch (error) {
        originHost = ""
    }

    const isCrossSite = Boolean(originHost) && originHost !== requestHost
    const isSecureRequest = req.secure || req.headers["x-forwarded-proto"] === "https"

    return {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: isCrossSite ? "none" : "lax",
        secure: isCrossSite || isSecureRequest,
    }
}

export const signUp=async (req,res)=>{
try {
    const {name,email,password}=req.body

    const existEmail=await User.findOne({email})
    if(existEmail){
        return res.status(400).json({message:"email already exists !"})
    }
    if(password.length<6){
        return res.status(400).json({message:"password must be at least 6 characters !"})
    }

    const hashedPassword=await bcrypt.hash(password,10)

    const user=await User.create({
        name,password:hashedPassword,email
    })

    const token=await genToken(user._id)

    res.cookie("token",token,getCookieOptions(req))

    const userObj = user.toObject()
    delete userObj.password

    return res.status(201).json({ ...userObj, token })

} catch (error) {
       return res.status(500).json({message:`sign up error ${error}`})
}
}

export const Login=async (req,res)=>{
try {
    const {email,password}=req.body

    const user=await User.findOne({email})
    if(!user){
        return res.status(400).json({message:"email does not exists !"})
    }
   const isMatch=await bcrypt.compare(password,user.password)

   if(!isMatch){
   return res.status(400).json({message:"incorrect password"})
   }

    const token=await genToken(user._id)

    res.cookie("token",token,getCookieOptions(req))

    const userObj = user.toObject()
    delete userObj.password

    return res.status(200).json({ ...userObj, token })

} catch (error) {
       return res.status(500).json({message:`login error ${error}`})
}
}

export const logOut=async (req,res)=>{
    try {
        res.clearCookie("token", getCookieOptions(req))
         return res.status(200).json({message:"log out successfully"})
    } catch (error) {
         return res.status(500).json({message:`logout error ${error}`})
    }
}
        
