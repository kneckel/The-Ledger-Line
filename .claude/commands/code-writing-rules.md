# Code Writing Rules

Adhere to the following rules when writing code:

## Development Workflow

- **Do not jump straight into writing code when starting a new task.** First analyze the project, read the relevant code files, understand the requirements thoroughly, and discuss the scope of work before beginning implementation. Only start coding immediately when given a straightforward, obvious command to execute specific work.

- **Actually read the code files using available tools before providing any analysis or starting work.** Do not rely on memory, assumptions, or patterns you think might exist without examining the actual implementation.

- **When editing code, make surgical changes directly related to the feature or issue.** Do not rewrite blocks of code for stylistics reasons. Only adjust code when there is a concrete functional gap to close - no stylistic or "nice to have" refactors.

- **Run `npm run type-check` before considering any TypeScript work complete.** Catch compiler errors and type issues as part of your standard workflow to ensure code quality.

## Code Quality Standards

- **Prefer stable, robust, and idiomatic patterns over clever solutions.** Choose boring but reliable approaches that are easy to understand and maintain, even if they require a bit more code.

- **Build solutions appropriate for our actual scale while maintaining robustness.** This system serves low thousands to tens of thousands of users managing tens of thousands to low millions of records, so focus on genuine improvements that matter at this scale rather than pursuing best practices designed for planet-scale systems or theoretical perfect solutions. Favor efficiency and performant code, but do not consider solutions for millions of requests per second or thousands of microservices

- **Prioritize readability and maintainability as primary concerns.** Write code that future developers can easily understand and modify, even if it means being more verbose.

- **Use meaningful, human-readable names throughout your code.** Avoid terse or obscure abbreviations like "hasPk", "idx", "ctx", "evt", "cfg", "op", "it", "arg", "out" in favor of descriptive names that clearly express purpose and intent.

- **Keep commenting minimal and purposeful.** Do not add extensive JSDoc comments or verbose documentation unless explicitly requested. When adding comments, use short, meaningful statements that explain non-obvious implementation details or novel approaches where the code cannot be self-documenting.

## Focus and Communication

- **Stay focused on the specific issue being discussed.** Do not provide feedback on unrelated code, features, or theoretical concerns that aren't directly relevant to the issue at hand.

- **Avoid perfectionism and bikeshedding on theoretical issues.** Recognize when the current implementation is good enough for its intended purpose rather than pursuing theoretical perfection.

- **Communicate clearly in prose using plain language.** Write in complete sentences using terms that any developer can understand, avoiding jargon and preferring natural sentences and paragraphs over bullet points or tables.

- **When implementing code, write clear commit messages and document any assumptions or design decisions made.** Provide context for future developers about why specific approaches were chosen, especially when deviating from obvious patterns.

## TypeScript & NestJS Patterns

- Use the `@/` path alias for all internal imports and sort imports by layer: external libraries, then `@/infrastructure`, `@/core`, and `@/domain`
- Apply NestJS decorators consistently and leverage dependency injection through constructor parameters with proper typing
- Create dedicated DTO classes for all API inputs and outputs with `class-validator` decorators for automatic validation
- Keep controllers lean and focused on HTTP handling only - controllers should pass through to a single service and contain no business logic
- Keep entities focused on data structure, delegate complex queries to repositories, and put business logic in service classes
- Use transactions where relevant for operations that require data consistency across multiple repository calls
- Follow established architectural patterns throughout the codebase rather than inventing new approaches - study existing implementations for registry entities, relationship management, access control, and temporal handling before creating new solutions
- Use `async/await` with explicit Promise return types, maintain strict TypeScript settings, and throw specific HTTP exceptions rather than generic errors
