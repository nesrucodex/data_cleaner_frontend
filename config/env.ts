const PASSWORD = process.env.PASSWORD as string
const USERNAME = process.env.USERNAME as string
const JWT_SECRET = process.env.JWT_SECRET as string
const BASE_URL = process.env.BASE_URL as string

export const ENV = {
    PASSWORD, USERNAME, JWT_SECRET, BASE_URL
}