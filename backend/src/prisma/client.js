// // src/prisma/client.js
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// export async function connectToDatabase() {
//   try {
//     await prisma.$connect()
//     console.log('PostgreSQL connected successfully.')
//   } catch (error) {
//     console.error(' Failed to connect to PostgreSQL:', error)
//     process.exit(1)
//   }
// }

// export default prisma
// // src/prisma/client.js
// // import { PrismaClient } from '@prisma/client'

// // const prisma = new PrismaClient({
// //   log: ['query', 'info', 'warn', 'error'],
// // })

// // export async function connectToDatabase() {
// //   try {
// //     console.log('Attempting to connect to database...')
// //     await prisma.$connect()
// //     console.log('✅ PostgreSQL connected successfully.')
    
// //     // Test the connection
// //     await prisma.$executeRaw`SELECT 1`
// //     console.log('✅ Database connection test successful.')
    
// //   } catch (error) {
// //     console.error('❌ Failed to connect to PostgreSQL:', error.message)
// //     console.error('Connection details:', {
// //       host: 'db.bhvhbfrflhyuijgeoxhz.supabase.co',
// //       port: 5432,
// //       database: 'postgres'
// //     })
// //     process.exit(1)
// //   }
// // }

// // export default prisma
// Replace entire file with:
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('PostgreSQL connected successfully.')
  } catch (error) {
    console.error(' Failed to connect to PostgreSQL:', error)
    process.exit(1)
  }
}

export default prisma