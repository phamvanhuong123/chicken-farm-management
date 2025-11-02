import { GET_DB } from '../config/mongodb.js'

const LOG_COLLECTION_NAME = 'logs'

const findByFlockId = async (flockId) => {
  try {
    const logs = await GET_DB()
      .collection(LOG_COLLECTION_NAME)
      .find({ flockId })
      .project({ _id: 1, date: 1, type: 1, quantity: 1, note: 1, userName: 1 })
      .sort({ date: -1 })
      .toArray()
    return logs
  } catch (error) {
    error.statusCode = 500
    error.message = 'Không thể tải nhật ký liên quan: ' + error.message
    throw error
  }
}

export const logModel = { LOG_COLLECTION_NAME, findByFlockId }
