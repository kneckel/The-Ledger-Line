# Code Review Rules

Adhere to the following rules when reviewing code, finding bugs, or solving issues:

## Review Focus and Process

- **Stay focused on the specific issue being discussed.** Do not provide feedback on unrelated code, features, or theoretical concerns that aren't directly relevant to the issue at hand.

- **Avoid perfectionism and bikeshedding on theoretical issues.** Recognize when the current implementation is good enough for its intended purpose rather than pursuing theoretical perfection.

- **Actually read the code files using available tools before providing any analysis or feedback.** Do not rely on memory, assumptions, or patterns you think might exist without examining the actual implementation.

- **When reviewing code, focus on correctness and maintainability risks with actionable specificity.** Skip formatting nits and provide file paths and line numbers for any issues found. If everything holds up, state that plainly rather than hunting for minor problems, but do call out any high-impact issues or residual risks worth tracking.

## Code Quality Assessment

- **Prefer stable, robust, and idiomatic patterns over clever solutions.** Evaluate whether the code chooses boring but reliable approaches that are easy to understand and maintain, even if they require a bit more code.

- **Build solutions appropriate for our actual scale while maintaining robustness.** This system serves low thousands to tens of thousands of users managing tens of thousands to low millions of records, so focus on genuine improvements that matter at this scale rather than pursuing best practices designed for planet-scale systems or theoretical perfect solutions. Favor efficiency and performant code, but do not consider solutions for millions of requests per second or thousands of microservices.

- **Prioritize readability and maintainability as primary concerns.** Assess whether the code can be easily understood and modified by future developers, even if it means being more verbose.

- **Use meaningful, human-readable names throughout your code.** Flag terse or obscure abbreviations like "hasPk", "idx", "ctx", "evt", "cfg", "op", "it", "arg", "out" and suggest descriptive names that clearly express purpose and intent.

- **Keep commenting minimal and purposeful.** Check that comments are short, meaningful statements that explain non-obvious implementation details or novel approaches where the code cannot be self-documenting. Flag excessive JSDoc comments or verbose documentation unless they add genuine value.

## Communication and Follow-up

- **Do not jump straight into providing solutions when reviewing code.** First analyze the project context, read the relevant code files, understand the requirements thoroughly, and identify the root cause before suggesting fixes. Only provide immediate solutions for straightforward, obvious issues.

- **Communicate clearly in prose using plain language.** Write in complete sentences using terms that any developer can understand, avoiding jargon and preferring natural sentences and paragraphs over bullet points or tables.

## Pattern Consistency Check

When reviewing code, verify adherence to established TypeScript & NestJS patterns:

- Check that `@/` path alias is used for internal imports and imports are sorted by layer: external libraries, then `@/infrastructure`, `@/core`, and `@/domain`
- Verify NestJS decorators are used consistently with proper dependency injection through constructor parameters
- Ensure dedicated DTO classes exist for API inputs and outputs with appropriate `class-validator` decorators
- Confirm controllers are lean and focused on HTTP handling only - controllers should pass through to a single service without business logic
- Verify entities focus on data structure, complex queries are delegated to repositories, and business logic resides in service classes
- Check that transactions are used appropriately for operations requiring data consistency across multiple repository calls
- Verify the code follows established architectural patterns rather than inventing new approaches - flag deviations from existing implementations for registry entities, relationship management, access control, and temporal handling
- Ensure `async/await` is used with explicit Promise return types and specific HTTP exceptions are thrown rather than generic errors
