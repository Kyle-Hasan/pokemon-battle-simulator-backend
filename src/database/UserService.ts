

import { Pokemon } from "../models/Pokemon";
import { Team, TeamModel } from "../models/Team"
import { User, UserModel } from "../models/User";

export class UserService {
    async getAllUserTeams(userId:string):Promise<Team[]> {



        const user= await UserModel.findById(userId).aggregate([
                    
            {
              $lookup: {
                from: "teams",
                localField: "teams",
                foreignField: "_id",
                as: "teams"
              }
            },
            
          ])

        .exec()

       
    
        return user?.teams ? user.teams : [];


    }

    

    
}