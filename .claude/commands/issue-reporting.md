# Issue Reporting

You have paused to report an issue. Write a structured issue report as a markdown file in the `docs/planning/` directory.

## FILE NAMING

Create a new file with this naming pattern:
```
work/issues/ISSUE-[YYYY-MM-DD]-[brief-description].md
```

Example: `work/issues/ISSUE-2025-10-25-unpublish-validation-gap.md`

## REPORT FORMAT

Write your report using clear, complete sentences. Avoid jargon without context. Each section should be detailed enough that another developer or AI agent without your current context can understand and act on the issue.

### 1. SUMMARY
- Provide a one-sentence description of the core problem
- State the severity/priority if obvious (Critical, High, Medium, Low)

### 2. CONTEXT
- Explain what you were doing when you discovered this issue (e.g., "While implementing tests for Workflow 6", "During code review of the authentication module")
- Reference any relevant planning documents, specifications, or requirements
- Include the work item/sprint/ticket number if applicable

### 3. ISSUE DESCRIPTION

For each distinct issue, provide:

**Issue Title:** [Descriptive name]

**Classification:** [Bug | Implementation Gap | Requirements Mismatch | Performance Issue | Security Vulnerability | Data Integrity Issue | Other]

**Location:**
- Controller: [Name and endpoint if applicable]
- Service: [Class name and method name]
- Repository: [Class name and method name]
- Database operation: [INSERT/UPDATE/SELECT/DELETE and table name]
- File path: [Full path from project root]
- Line number(s): [Specific lines or range]

**Expected Behavior:**
[Describe what should happen according to requirements, specifications, or reasonable expectations. Use complete sentences.]

**Actual Behavior:**
[Describe what actually happens. Use complete sentences. Include error messages, wrong outputs, or missing functionality.]

**Evidence:**
- Test results: [Pass/fail status, assertion failures]
- Error messages: [Full error text]
- Log output: [Relevant log entries]
- Code snippet: [The problematic code if helpful]

**Impact:**
[Explain the consequences of this issue. Who/what is affected? Does it block other work? Does it affect production?]

**Reproduction Steps:** (if applicable)
1. [Clear step-by-step instructions to reproduce]
2. [Include test commands, API calls, or user actions]
3. [Include any necessary setup or preconditions]

### 4. METADATA
- **Discovered by:** [Your agent name/identifier]
- **Date discovered:** [Timestamp]
- **Code version/commit:** [Git commit hash or version number]
- **Branch:** [Git branch name]
- **Author of problematic code:** [Git blame info if relevant]
- **Related work items:** [Sprint numbers, ticket IDs, story IDs]

### 5. ANALYSIS
- Explain why this is happening based on your code review
- Identify root cause if known
- Note any patterns (e.g., "This same validation gap exists in 3 other service methods")

### 6. QUESTIONS FOR CLARIFICATION
List any questions that need to be answered before proceeding:
- Should the code be fixed to match the specification?
- Should the specification be updated to match the code?
- Are there business reasons for the current behavior?
- What is the intended design?

### 7. SUGGESTED NEXT STEPS
Provide options for resolution:
- Option A: [Describe approach and implications]
- Option B: [Describe alternative and implications]
- Recommendation: [Your recommended approach with reasoning]

---

## IMPORTANT GUIDELINES

1. **Be factual and objective.** Report what you observe, not what you assume.
2. **Be specific.** Instead of "the validation doesn't work," write "The cancelEvent method in schedule-administration.service.ts (line 365) does not check if event.status is already Inactive before setting it to Inactive, allowing duplicate cancellations."
3. **Separate facts from opinions.** Clearly distinguish between what the code does (fact) and what it should do (interpretation/opinion).
4. **Include enough context** that someone reading this report 2 weeks from now, or another AI agent, can understand the issue without needing to ask you questions.
5. **Group related issues** but keep each one clearly separated and numbered.
6. **Cross-reference.** If multiple issues are related, note the relationships.
7. **Quantify when possible.** Include numbers (test counts, affected records, performance metrics) when relevant.

---

After creating the report file, confirm the file path and wait for direction before making any code changes.
