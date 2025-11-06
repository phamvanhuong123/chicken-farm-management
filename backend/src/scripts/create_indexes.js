const dotenv = require('dotenv')
const { MongoClient } = require('mongodb')

dotenv.config()

const url = process.env.MONGODB_URL
const dbName = process.env.DATABASE_NAME

if (!url || !dbName) {
  console.error('Please set MONGODB_URL and DATABASE_NAME in env')
  process.exit(1)
}

;(async () => {
  const client = new MongoClient(url)
  try {
    await client.connect()
    const db = client.db(dbName)
    const users = db.collection('users')

    console.log('Creating unique index on users.email...')
    await users.createIndex({ email: 1 }, { unique: true, sparse: true })
    console.log('Creating unique index on users.phone...')
    await users.createIndex({ phone: 1 }, { unique: true, sparse: true })

    console.log('Indexes created successfully')
  } catch (err) {
    console.error('Failed to create indexes', err)
  } finally {
    await client.close()
  }
})()
