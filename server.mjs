// @ts-check
import express from 'express'
import morgan from 'morgan'

// Only available after build
// @ts-ignore
import { handler as ssrHandler } from './dist/server/entry.mjs'

const app = express()

// Trust proxy
app.set('trust proxy', true)

// logger
app.use(morgan('common'))

// handler
app.use('/', express.static('dist/client/'))
app.use(ssrHandler)

const PORT = 4321
app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`)
})
