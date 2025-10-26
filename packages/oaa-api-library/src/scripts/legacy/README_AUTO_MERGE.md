# OAA Auto-Merge Agent

This agent automatically merges files from the `OAA-edits/v1` and `OAA-edits/v2` folders into the root directory every hour, keeping the repository organized.

## Features

- **Automatic Merging**: Monitors `OAA-edits/v1` and `OAA-edits/v2` folders for new files
- **Smart Copying**: Only copies files that don't already exist in the root directory
- **Cleanup**: Removes files from source directories after successful merge
- **Logging**: Provides detailed logs of all operations
- **Cross-Platform**: Available in both Node.js and PowerShell versions

## Files

- `auto_merge_agent.js` - Node.js version (cross-platform)
- `auto_merge_agent.ps1` - PowerShell version (Windows)
- `start_auto_merge.bat` - Windows batch file to start the agent
- `README_AUTO_MERGE.md` - This documentation

## Usage

### PowerShell Version (Recommended for Windows)

```powershell
# Start the agent
.\auto_merge_agent.ps1 -Start

# Stop the agent
.\auto_merge_agent.ps1 -Stop

# Check status
.\auto_merge_agent.ps1 -Status

# Run a test merge
.\auto_merge_agent.ps1 -Test
```

### Node.js Version

```bash
# Start the agent
node auto_merge_agent.js

# Stop with Ctrl+C
```

### Windows Batch File

```cmd
# Double-click start_auto_merge.bat or run from command line
start_auto_merge.bat
```

## How It Works

1. **Monitoring**: The agent checks `OAA-edits/v1` and `OAA-edits/v2` folders every hour
2. **Detection**: Identifies new files and directories in these folders
3. **Merging**: Copies new items to the root directory (skipping existing files)
4. **Cleanup**: Removes the original files from source directories after successful copy
5. **Logging**: Records all operations with timestamps

## Configuration

The agent runs with these default settings:
- **Interval**: 1 hour (3600 seconds)
- **Source Directories**: `OAA-edits/v1` and `OAA-edits/v2`
- **Target Directory**: Root directory of the project

## Logging

All operations are logged with timestamps in the format:
```
[YYYY-MM-DDTHH:mm:ss.fffZ] OAA Auto-Merge Agent: [message]
```

## Error Handling

- The agent continues running even if individual operations fail
- Errors are logged but don't stop the agent
- Graceful shutdown on SIGINT/SIGTERM signals

## Requirements

### PowerShell Version
- Windows PowerShell 5.0 or later
- PowerShell Core 6.0+ for cross-platform support

### Node.js Version
- Node.js 12.0 or later
- No additional dependencies required

## Troubleshooting

1. **Permission Issues**: Ensure the script has write permissions to the directories
2. **Path Issues**: Make sure the script is run from the correct directory
3. **PowerShell Execution Policy**: Use `-ExecutionPolicy Bypass` if needed

## Example Output

```
[2024-01-15T10:30:00.000Z] OAA Auto-Merge Agent: Starting OAA Auto-Merge Agent...
[2024-01-15T10:30:00.100Z] OAA Auto-Merge Agent: Will check for new files every 60 minutes
[2024-01-15T10:30:00.200Z] OAA Auto-Merge Agent: Starting auto-merge process...
[2024-01-15T10:30:00.300Z] OAA Auto-Merge Agent: Found 2 items in v1 directory
[2024-01-15T10:30:00.400Z] OAA Auto-Merge Agent: Copying file new_package.zip from v1...
[2024-01-15T10:30:00.500Z] OAA Auto-Merge Agent: Successfully copied file new_package.zip
[2024-01-15T10:30:00.600Z] OAA Auto-Merge Agent: Cleaned up v1 directory
[2024-01-15T10:30:00.700Z] OAA Auto-Merge Agent: Auto-merge process completed successfully
[2024-01-15T10:30:00.800Z] OAA Auto-Merge Agent: Agent started successfully
```

