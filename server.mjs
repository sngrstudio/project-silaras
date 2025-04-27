// @ts-check
import express from 'express'
import morgan from 'morgan'
import { handler as ssrHandler } from './dist/server/entry.mjs'

const app = express()
app.use(morgan('common'))
// Change this based on your astro.config.mjs, `base` option.
// They should match. The default value is "/".
app.use('/', express.static('dist/client/'))
app.use(ssrHandler)

app.listen(4321, () => console.log('Server started!'))
