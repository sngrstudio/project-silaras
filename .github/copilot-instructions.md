Our application uses Astro + React with session-based auth, where data flows: User interactions → React components → Astro Actions → Query functions (src/db/queries) → Drizzle ORM → MySQL, with nanostores for client state and Cloudinary for file storage.

We follow a strict data flow architecture where React components only receive data through props, stores, or actions, so never suggest importing database utilities or query functions directly in components.

When writing actions, always import query functions from `src/db/queries` instead of importing database utilities directly, and if the needed query functions don't exist, create them in that directory first.

Our query functions in `src/db/queries` should focus only on database operations without importing utility functions, since utilities are meant to be used in the actions layer. The only exception is Redis which tied tightly with the database function.

Don't suggest running build, dev, or type check commands when helping with code.

Every import must be static, do not import dynamically.
