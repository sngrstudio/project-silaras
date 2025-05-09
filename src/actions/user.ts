import { defineAction } from 'astro:actions'

const user = {
  signup: defineAction({
    handler: (_, { session }) => {}
  })
}

export default user
