# Development Tools

This directory contains development tools, scripts, and utilities for the Civic Protocol Core ecosystem.

## Scripts

Automation scripts for development workflow and maintenance tasks.

### Available Scripts

- **`autocommit.ps1`** - PowerShell script for automatic commit generation
- **`detect-scope.sh`** - Bash script for detecting commit scope
- **`generate-commit-msg.sh`** - Bash script for generating commit messages
- **`redaction-scan.sh`** - Bash script for scanning and redacting sensitive content
- **`start-autocommit.bat`** - Windows batch file to start auto-commit process

### Usage

#### PowerShell Scripts (Windows)

```powershell
# Run auto-commit script
.\scripts\autocommit.ps1

# Start auto-commit process
.\scripts\start-autocommit.bat
```

#### Bash Scripts (Linux/macOS)

```bash
# Detect commit scope
./scripts/detect-scope.sh

# Generate commit message
./scripts/generate-commit-msg.sh

# Scan for sensitive content
./scripts/redaction-scan.sh
```

## Utilities

Development utilities and helper tools.

### Citizen Shield TypeScript Fix Pack

TypeScript fixes and improvements for the Citizen Shield application:

```
utilities/citizen-shield-ts-fix/
├── README_TypeFix.md    # Documentation for TypeScript fixes
├── src/
│   └── vite-env.d.ts    # Vite environment type definitions
└── tsconfig.json        # TypeScript configuration
```

### Genesis Custodian Tools

Tools for working with Genesis Custodian Events:

- **`generate_checksum.py`** - SHA-256 checksum generator for manifest files
- **`get_lab4_token.py`** - Lab4 authentication token generator

#### Generate Checksum

```bash
# Generate checksum for a manifest file
python tools/utilities/generate_checksum.py Concord_Custodian_Manifest.pdf

# Auto-detect manifest file
python tools/utilities/generate_checksum.py
```

#### Get Lab4 Token

```bash
# Generate Lab4 authentication token
python tools/utilities/get_lab4_token.py
```

### Other Utilities

- **`pal_eval.py`** - PAL (Program-Aided Language) evaluation tool

## Development Workflow

### Auto-Commit System

The auto-commit system helps maintain clean commit history:

1. **Scope Detection**: Automatically detects the scope of changes
2. **Message Generation**: Creates meaningful commit messages
3. **Redaction Scanning**: Ensures no sensitive content is committed
4. **Automatic Execution**: Runs automatically on file changes

### Setup Auto-Commit

#### Windows

```batch
# Start the auto-commit system
tools\scripts\start-autocommit.bat
```

#### Linux/macOS

```bash
# Make scripts executable
chmod +x tools/scripts/*.sh

# Run scope detection
./tools/scripts/detect-scope.sh

# Generate commit message
./tools/scripts/generate-commit-msg.sh
```

## Best Practices

### Script Development

1. **Error Handling**: Include proper error handling and logging
2. **Cross-Platform**: Ensure scripts work on Windows, Linux, and macOS
3. **Documentation**: Document script purpose and usage
4. **Testing**: Test scripts thoroughly before committing

### Utility Development

1. **Type Safety**: Use TypeScript for type-safe utilities
2. **Input Validation**: Validate all inputs and parameters
3. **Error Messages**: Provide clear and helpful error messages
4. **Documentation**: Include comprehensive documentation

## Troubleshooting

### Common Issues

- **Permission Errors**: Ensure scripts have proper execute permissions
- **Path Issues**: Use relative paths and handle different operating systems
- **Dependency Issues**: Check that all required tools are installed
- **Script Failures**: Review error messages and check script syntax

### Getting Help

1. Check the script documentation and comments
2. Review error messages and logs
3. Test scripts in isolation
4. Check system requirements and dependencies

## Contributing

When adding new tools or scripts:

1. **Follow Conventions**: Use consistent naming and structure
2. **Add Documentation**: Include README files and inline comments
3. **Test Thoroughly**: Test on multiple platforms and scenarios
4. **Update This README**: Document new tools and their usage

