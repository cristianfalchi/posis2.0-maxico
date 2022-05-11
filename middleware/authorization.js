
import { redirect } from "express/lib/response";
import { getAuth, updateProfile } from "firebase/auth";

export function authorization(req, res, next) {
   
    const auth = getAuth();
    if (!auth.currentUser) {
        res.redirect('/login');
    } else {
        // Para actualizar cualquier datos del usuario que se registre
        // updateProfile(auth.currentUser, {
        //     displayName: "Enrique C."
        // })
        next();
    }

}