// Todo: Make sure not being re-instantiated
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma;
