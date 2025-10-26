# Contributing to Civic Protocol Core

Thank you for your interest in contributing to Civic Protocol Core! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Python 3.8+ or Node.js 16+
- Git
- Basic understanding of blockchain concepts
- Familiarity with civic governance principles

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/civic-protocol-core.git
   cd civic-protocol-core
   ```

2. **Install dependencies**
   ```bash
   # Python dependencies
   pip install -r requirements.txt
   
   # JavaScript dependencies (if working on JS components)
   cd sdk/js && npm install
   ```

3. **Run the development node**
   ```bash
   python sdk/python/devnode.py
   ```

4. **Test the example app**
   ```bash
   cd examples/hello-reflection-app
   python app.py
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names that indicate the type of change:

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Examples:
```
feat(consensus): implement Proof-of-Cycle consensus mechanism
fix(sdk): resolve connection timeout in Python client
docs(api): update OpenAPI specification for v0.2
```

### Development Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run Python tests
   python -m pytest tests/
   
   # Run JavaScript tests
   cd sdk/js && npm test
   
   # Run integration tests
   python tests/integration_test.py
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### Python

- Follow PEP 8 style guidelines
- Use type hints for function parameters and return values
- Write docstrings for all public functions and classes
- Use meaningful variable and function names
- Keep functions small and focused

Example:
```python
def create_reflection(author: str, content_hash: str, 
                     visibility: str = "private") -> Reflection:
    """
    Create a new civic reflection with privacy protection.
    
    Args:
        author: Citizen ID of the author
        content_hash: Hash of encrypted reflection content
        visibility: Visibility level ("private" or "public")
        
    Returns:
        Created reflection object
        
    Raises:
        Exception: If rate limit is exceeded
    """
    # Implementation here
    pass
```

### JavaScript

- Use ES6+ features
- Follow the Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Use async/await for asynchronous operations

Example:
```javascript
/**
 * Add a new reflection
 * @param {Object} reflectionData - Reflection data
 * @returns {Promise<Object>} Created reflection object
 */
async function addReflection(reflectionData) {
    // Implementation here
}
```

### General Guidelines

- Write self-documenting code
- Add comments for complex logic
- Use consistent naming conventions
- Handle errors gracefully
- Write tests for edge cases

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and fixtures
```

### Running Tests

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest tests/unit/test_consensus.py

# Run with coverage
python -m pytest --cov=src tests/

# Run JavaScript tests
cd sdk/js && npm test
```

### Writing Tests

- Write tests for all new functionality
- Aim for high test coverage (>80%)
- Test both success and failure cases
- Use descriptive test names
- Mock external dependencies

Example:
```python
def test_create_reflection_success():
    """Test successful reflection creation"""
    poc = ProofOfCycle(create_genesis_policy())
    citizen = poc.register_citizen("0x123")
    
    reflection = poc.create_reflection(
        author=citizen,
        content_hash="0xabc",
        visibility="public"
    )
    
    assert reflection.author == citizen
    assert reflection.visibility == "public"
    assert reflection.ref_id is not None

def test_create_reflection_rate_limit():
    """Test reflection creation with rate limit exceeded"""
    poc = ProofOfCycle(create_genesis_policy())
    citizen = poc.register_citizen("0x123")
    
    # Exceed rate limit
    for _ in range(15):  # More than daily limit
        poc.create_reflection(citizen, "0xabc", "public")
    
    with pytest.raises(Exception, match="Rate limit exceeded"):
        poc.create_reflection(citizen, "0xabc", "public")
```

## Documentation

### Code Documentation

- Write clear docstrings for all public functions
- Include parameter types and descriptions
- Document return values and exceptions
- Add usage examples where helpful

### API Documentation

- Keep OpenAPI specification up to date
- Document all endpoints and parameters
- Include example requests and responses
- Update version numbers appropriately

### README Files

- Keep README files current and comprehensive
- Include setup and usage instructions
- Add examples and code snippets
- Update when adding new features

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   python -m pytest
   ```

2. **Check code style**
   ```bash
   # Python
   flake8 src/
   black --check src/
   
   # JavaScript
   cd sdk/js && npm run lint
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update docstrings
   - Update API documentation

4. **Rebase on main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

### Pull Request Template

When creating a pull request, include:

- **Description**: What changes were made and why
- **Type**: Feature, bug fix, documentation, etc.
- **Testing**: How the changes were tested
- **Breaking Changes**: Any breaking changes
- **Related Issues**: Link to related issues

### Review Process

1. **Automated checks** must pass
2. **Code review** by at least one maintainer
3. **Testing** on development environment
4. **Documentation** review
5. **Approval** and merge

## Issue Reporting

### Before Creating an Issue

1. Check existing issues to avoid duplicates
2. Search the documentation for solutions
3. Try the latest version

### Issue Template

When creating an issue, include:

- **Description**: Clear description of the problem
- **Steps to Reproduce**: How to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Python/Node version, etc.
- **Additional Context**: Any other relevant information

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information is requested

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear and constructive language
- Help others learn and grow
- Follow the code of conduct

### Getting Help

- Check the documentation first
- Search existing issues and discussions
- Ask questions in GitHub Discussions
- Join community channels (when available)

### Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Community acknowledgments

## Development Roadmap

### Current Priorities

1. **Core Protocol**: Complete Proof-of-Cycle consensus
2. **Privacy Layer**: Implement Shield with zkRL
3. **Governance**: Enhance Agora voting mechanisms
4. **SDKs**: Improve client libraries
5. **Documentation**: Comprehensive guides and examples

### Future Features

- Mobile SDKs
- Browser extensions
- Integration tools
- Advanced privacy features
- Cross-chain compatibility

## License

By contributing to Civic Protocol Core, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue with the `question` label
4. Join community discussions

Thank you for contributing to Civic Protocol Core! Together, we're building a more democratic and transparent future.

