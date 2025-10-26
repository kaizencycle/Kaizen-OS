# Quest Verifier Unit Test System

This system provides comprehensive testing for the secret quest hash generation and verification mechanism in the HIVE JRPG.

## Overview

The quest verifier tests ensure that:
1. Secret quest hashes are generated correctly from CSV seed data
2. Quest files contain the proper `secretHash` values in their front-matter
3. The verification API logic works correctly
4. Error handling works for missing files, incorrect hashes, and malformed data

## Files

- `scripts/test-quest-verifier.mjs` - Main test script
- `ops/seeds/secret-seeds.csv` - CSV file containing quest seed data
- `lore/quests/*.md` - Quest files with YAML front-matter
- `.github/workflows/quest-verifier-test.yml` - CI workflow

## Usage

### Run Tests Locally

```bash
# Basic test run
npm run test:quest-verifier

# Verbose output
npm run test:quest-verifier:verbose

# Direct script execution
node scripts/test-quest-verifier.mjs [--verbose]
```

### CSV Format

The CSV file should have the following format:
```csv
questId,proofId,playerId
test-quest-1,proof-123,player-456
test-quest-2,proof-789,player-012
```

### Quest File Format

Quest files should have YAML front-matter with:
```yaml
---
id: quest-id
title: Quest Title
kind: secret
canonLevel: B
secretHash: sha256:generated-hash
accord: truth
region: test
archetype:
  western: hero
  eastern: warrior
---
```

## Test Coverage

The test system validates:

1. **CSV Parsing**: Correctly reads and parses the seed CSV file
2. **Hash Generation**: Generates correct SHA256 hashes from proofId + playerId + salt
3. **Quest File Validation**: 
   - Quest file exists
   - Front-matter is parseable
   - Quest is marked as `kind: secret`
   - `secretHash` field is present
   - Hash matches expected value
4. **API Verification**: Simulates the verification logic used in the API
5. **Error Handling**: Tests missing files, malformed data, and hash mismatches

## Environment Variables

- `SECRET_SALT`: Secret salt for hash generation (default: 'test-salt-for-ci')

## CI Integration

The GitHub Actions workflow automatically:
- Creates test data if it doesn't exist
- Generates correct hashes for test quests
- Runs the verification tests
- Tests error conditions (wrong salt, missing files)
- Provides clear pass/fail feedback

## Security Notes

- Uses the same hash generation logic as the production system
- Tests both correct and incorrect scenarios
- Validates that client-side manipulation would be detected
- Ensures secret salt is properly used in hash generation

## Troubleshooting

### Test Failures

1. **Missing CSV file**: Ensure `ops/seeds/secret-seeds.csv` exists
2. **Missing quest files**: Ensure quest files exist in `lore/quests/`
3. **Hash mismatches**: Check that `SECRET_SALT` matches between generation and verification
4. **Front-matter parsing errors**: Ensure YAML syntax is correct in quest files

### Debug Mode

Use `--verbose` flag for detailed output:
```bash
npm run test:quest-verifier:verbose
```

This will show:
- CSV parsing details
- Hash generation steps
- Quest file validation steps
- API verification details
- Error stack traces

