export interface User {
    id?:Number,
    username:String,
    first_name:String,
    last_name:String,
    password:String,
    email:String,
    profile_image?:String,
    birthdate?:Date | null,
    gender?:String
}
