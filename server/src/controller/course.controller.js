import courseModel from '../../src/model/course.model.js'
import { apiResponse } from '../utils/api.utils.js'

export const createCourse = async (req , res) => {
    const user = req.user
    const {title , description , price , thumbnail} = req.body

    const course = await courseModel.create({
        title,
        description,
        price,
        thumbnail,
        adminId : user._id,
        isPublished : true
    })

    return apiResponse(res , 201 , 'course created SuccessFully' , course)
}