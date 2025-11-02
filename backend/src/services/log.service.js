import { logModel } from '../models/log.model.js'

const getLogsByFlockId = async (flockId) => {
  try {
    const logs = await logModel.findByFlockId(flockId)
    return logs
  } catch (error) {
    throw error
  }
}

export const logService = { getLogsByFlockId }
