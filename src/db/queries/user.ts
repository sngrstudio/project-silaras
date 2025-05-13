import { db } from '../db'
import { userView } from '../schema/user'

export const getAllUsers = async () => {
  const getAllUsersSQL = db
    .select({
      userName: userView.userName,
      fullName: userView.fullName,
      accessLevel: userView.accessLevel,
      phoneNumber: userView.phoneNumber,
      profilePhoto: userView.profilePhoto
    })
    .from(userView)
    .prepare()

  return await getAllUsersSQL.execute()
}
