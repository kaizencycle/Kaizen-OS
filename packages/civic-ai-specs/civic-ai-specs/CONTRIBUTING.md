# Contributing

Thank you for your interest in contributing to the Civic AI Standard!

## Getting Started

1. **Fork and create a feature branch**
   ```bash
   git fork kaizencycle/civic-ai-specs
   git checkout -b feature/your-feature-name
   ```

2. **Install dependencies and run tests**
   ```bash
   npm ci
   npm run test  # if examples exist
   ```

3. **Run validation scripts**
   ```bash
   npm run lint:lore      # lore linter
   npm run build:indexes  # beacon/lore indexes
   ```

4. **Include citations** in specs or E.O.M.M. entries when relevant

## Pull Request Process

Open a PR with:
- **Summary**: Clear description of changes
- **Rationale**: Why this change is needed
- **Security notes**: Any security implications
- **Schema changes**: If any schemas were modified
- **Screenshots**: For UI documentation changes

## Development Standards

### Code Quality
- All tests must pass
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### Lore and Specs
- Maintain consistency with existing lore
- Follow the established archetype patterns
- Include proper citations and references
- Validate against schemas before submitting

### Commit Standards
- Use conventional commit format
- Sign your commits: `git commit -s`
- Write clear, descriptive commit messages
- Reference issues when applicable

## Code of Conduct

We follow [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

**Be excellent to each other.**

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project:
- **Client SDKs & Examples**: Apache-2.0
- **Server Reference Implementations**: AGPL-3.0  
- **Specifications & Documentation**: CC BY 4.0

## Questions?

- Open an issue for general questions
- Join our community discussions
- Contact maintainers for sensitive matters

© 2025 Kaizen Cycle / Michael Judan — Civic AI Standard
