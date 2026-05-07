# Writing Guidelines

When writing technical documentation or instructions, follow these principles to ensure clarity, consistency, and professional quality.

## COMMUNICATION PRINCIPLES

**Write in Complete Sentences**: Every statement must be a full sentence with a subject and verb. Avoid sentence fragments, terse phrases, or abbreviated statements that lack context.

**Use Prose, Not Bullet Lists**: Default to writing in natural paragraphs. Use bullet points only when listing distinct items where each bullet contains a complete sentence or thought. Never use bullets as a substitute for proper explanatory prose.

**Be Specific, Not Vague**: Provide concrete details, examples, and context. Avoid abstract generalizations or hand-waving that forces readers to fill in gaps.

**Avoid Jargon and Abbreviations**: Use clear, plain language that any developer can understand. When technical terms are necessary, explain them. Avoid cryptic abbreviations or insider terminology without context.

**Make Each Statement Self-Contained**: Every sentence should make sense on its own. A reader should be able to understand a statement without needing to mentally reconstruct missing context from surrounding text.

### Examples of Good vs Bad Communication

❌ **Bad (Terse fragments)**:
- Validation layer
- Maintains invariants
- Type checking

✅ **Good (Complete sentences)**:
- The validation layer maintains data invariants through explicit type checking at API boundaries.

❌ **Bad (Vague)**:
The system handles edge cases appropriately.

✅ **Good (Specific)**:
The validation layer rejects null values for required fields and returns a 400 Bad Request with a detailed error message identifying which fields failed validation.

❌ **Bad (Jargon without context)**:
Use DI for SRP compliance in IOC.

✅ **Good (Plain language)**:
The application uses dependency injection to ensure each service class has a single, well-defined responsibility. This approach allows services to be tested in isolation and makes dependencies explicit through constructor parameters.

❌ **Bad (Meaningless bullets)**:
- Performance
- Security
- Scalability
- Maintainability

✅ **Good (Substantive bullets with complete thoughts)**:
- The caching layer improves response time by storing frequently accessed records in memory, reducing database queries by approximately 60% for read-heavy endpoints.
- Authentication tokens expire after 24 hours to limit the window of vulnerability if a token is compromised.
- The database schema uses indexed foreign keys on all relationship tables to maintain query performance as the dataset grows beyond 100,000 records.
- Service classes separate business logic from HTTP handling, making it straightforward to add new endpoints or modify existing behavior without touching multiple layers.

## VOICE AND TONE

**Professional and Accessible**: Write for a technical audience without being overly casual. Maintain technical precision while remaining welcoming.

**Factual, Not Prescriptive**: State what the system does and requires. Avoid imperatives like "Never do X" or "Always do Y."

**Principle-Driven**: Motivate through correctness and architectural principles rather than warnings about failures. Focus on "why this is right" not "what breaks if you don't."

**Impersonal Construction**: Avoid "you" entirely. Use passive voice and impersonal constructions. Document the system and its requirements, not instructions to readers.

**Present Tense Only**: Write from current state. Avoid historical narratives ("evolved from," "was originally") or future promises ("will become," "plans to"). Document what IS, not what was or will be.

## CONTENT STRUCTURE

### Emphasis Order
Prioritize information in this order:
1. **HOW TO THINK** (philosophy): Conceptual framework for understanding the problem space
2. **WHY** (rationale): The specific problem being solved or decision being made
3. **WHAT** (solution): The approach taken
4. **HOW** (implementation): Specific details, only when essential for clarity

### Example-Driven
Every feature or concept should include clear, concrete examples with request/response pairs or code snippets. Examples must be complete and runnable, not pseudocode or fragments.

## FORMATTING STANDARDS

**Paragraphs Over Bullets**: Write explanations in natural paragraph form. Reserve bullet points for lists of distinct items where prose would be awkward.

**When Using Bullets**: Each bullet point must contain a complete sentence or substantive thought. Never use 3-4 word fragments that lack meaning in isolation.

**Code Blocks**:
- Always use language tags (` ```typescript`, ` ```json`, ` ```bash`)
- Include comments indicating filenames or highlighting key lines
- Keep examples focused and minimal but complete enough to understand

**Cross-Links**: Link to related sections for additional detail rather than repeating information.

**Active Voice**: Write "The API returns a response" not "A response is returned by the API."

## WRITING GUIDELINES

### Avoid Personal Pronouns

❌ "when you process it"
✅ "when it is processed"

❌ "You should verify the context"
✅ "The system maintains explicit context"

### State Facts, Not Warnings

❌ "A single mistake can corrupt data in production"
✅ "The validation layer maintains data invariants through explicit type checking"

❌ "Never assume the value represents what you think"
✅ "Values do not carry semantic metadata. The distinction exists only in how the application interprets the value."

### Motivate Through Principles, Not Contingencies

❌ "different servers produce different values" (failure scenario)
✅ "processing must produce identical results regardless of server configuration" (correctness principle)

❌ "This bug only surfaces when X happens"
✅ "The pattern produces consistent results across all configurations"

### Descriptive, Not Imperative

❌ "Never assume... Always verify... Test across environments"
✅ "The system applies explicit normalization. Logic undergoes validation across different configurations."

❌ "You must use typed decorators"
✅ "Typed decorators make semantics explicit at API boundaries"

### Focus on Correctness, Not Failure

❌ "Without this, the system will break"
✅ "This pattern maintains semantic correctness across deployment environments"

❌ "This prevents bugs that are hard to catch"
✅ "Explicit validation preserves the invariant that data remains consistent"

### Present Tense Only

❌ "The module evolved from a simple service into a three-tier architecture as features expanded"
✅ "The module uses a three-tier architecture"

❌ "When first built, it worked well, but problems surfaced..."
✅ "Different consumers require different capability subsets. A single service creates segregation problems"

❌ "This will enable future extensibility"
✅ "This pattern supports extension through composition"

## DOCUMENTATION ORGANIZATION

**Be Clear About Scope**: Start with a brief 1-2 sentence introduction explaining what the section covers. Use complete, informative sentences.

**Logical Sections**: Use descriptive headers to organize content hierarchically. Headers should be clear and specific, not vague labels.

**Concrete Examples**: Follow explanations with code examples showing real usage patterns. Include enough context that examples make sense standalone.

**Single Source of Truth**: Documentation reflects actual implementation. When in doubt, the code is authoritative.

---

**Critical Reminder**: Write documentation in natural, flowing prose using complete sentences with proper grammar and structure. Avoid terse fragments, cryptic abbreviations, and bullet points that substitute for proper explanation. Every statement should be clear enough that a developer unfamiliar with the codebase can understand it without additional context.