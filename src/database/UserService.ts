

import { Types } from "mongoose";
import { Pokemon } from "../models/Pokemon";
import { Team, TeamModel } from "../models/Team"
import { User, UserModel } from "../models/User";

export class UserService {
    async getAllUserTeams(userId:string):Promise<Team[]> {



      const userArr = await UserModel.aggregate([
        { $match: { _id: new Types.ObjectId(userId) } }, // ✅ Convert `userId` to ObjectId and match
        {
          $lookup: {
            from: "teams",
            localField: "teams",
            foreignField: "_id",
            as: "teams",
          },
        },
      ]).exec();
      let user:{
        teams:Team[]
      }
      if(userArr.length === 0){
        throw new Error("User doesnt exist")
      }
      
      
        user = userArr[0]
        
      

       
    
        return user?.teams ? user.teams : [];


    }

    

    
}