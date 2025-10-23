# OAA Auto-Merge Agent (PowerShell Version)
# Automatically merges files from OAA-edits/v1 and v2 folders into root directory
# Runs every hour to keep the repository organized

param(
    [switch]$Start,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Test
)

$script:AgentRunning = $false
$script:Interval = $null
$script:RootDir = Split-Path -Parent $PSScriptRoot
$script:V1Dir = Join-Path $script:RootDir "OAA-edits\v1"
$script:V2Dir = Join-Path $script:RootDir "OAA-edits\v2"
$script:IntervalSeconds = 3600 # 1 hour

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    Write-Host "[$timestamp] OAA Auto-Merge Agent: $Message"
}

function Test-AndMergeDirectory {
    param(
        [string]$SourceDir,
        [string]$Version
    )
    
    try {
        if (-not (Test-Path $SourceDir)) {
            Write-Log "Directory $SourceDir does not exist, skipping..."
            return
        }

        $items = Get-ChildItem $SourceDir
        if ($items.Count -eq 0) {
            Write-Log "No items found in $Version directory"
            return
        }

        Write-Log "Found $($items.Count) items in $Version directory"

        foreach ($item in $items) {
            $sourcePath = Join-Path $SourceDir $item.Name
            $destPath = Join-Path $script:RootDir $item.Name

            if ($item.PSIsContainer) {
                # Handle directory
                if (Test-Path $destPath) {
                    Write-Log "Directory $($item.Name) already exists in root, skipping..."
                } else {
                    Write-Log "Copying directory $($item.Name) from $Version..."
                    Copy-Item $sourcePath -Destination $destPath -Recurse -Force
                    Write-Log "Successfully copied directory $($item.Name)"
                }
            } else {
                # Handle file
                if (Test-Path $destPath) {
                    Write-Log "File $($item.Name) already exists in root, skipping..."
                } else {
                    Write-Log "Copying file $($item.Name) from $Version..."
                    Copy-Item $sourcePath -Destination $destPath -Force
                    Write-Log "Successfully copied file $($item.Name)"
                }
            }
        }

        # Clean up source directory after successful merge
        Clear-Directory -SourceDir $SourceDir -Version $Version

    } catch {
        Write-Log "Error processing $Version directory: $($_.Exception.Message)"
    }
}

function Clear-Directory {
    param(
        [string]$SourceDir,
        [string]$Version
    )
    
    try {
        $items = Get-ChildItem $SourceDir
        foreach ($item in $items) {
            $itemPath = Join-Path $SourceDir $item.Name
            if ($item.PSIsContainer) {
                Remove-Item $itemPath -Recurse -Force
            } else {
                Remove-Item $itemPath -Force
            }
        }
        Write-Log "Cleaned up $Version directory"
    } catch {
        Write-Log "Error cleaning up $Version directory: $($_.Exception.Message)"
    }
}

function Start-AutoMerge {
    if ($script:AgentRunning) {
        Write-Log "Agent is already running"
        return
    }

    $script:AgentRunning = $true
    Write-Log "Starting OAA Auto-Merge Agent..."
    Write-Log "Will check for new files every $($script:IntervalSeconds / 60) minutes"

    # Perform initial merge
    Invoke-AutoMerge

    # Set up timer
    $script:Interval = [System.Timers.Timer]::new($script:IntervalSeconds * 1000)
    $script:Interval.Add_Elapsed({
        Invoke-AutoMerge
    })
    $script:Interval.AutoReset = $true
    $script:Interval.Start()

    Write-Log "Agent started successfully"
}

function Stop-AutoMerge {
    if (-not $script:AgentRunning) {
        Write-Log "Agent is not running"
        return
    }

    if ($script:Interval) {
        $script:Interval.Stop()
        $script:Interval.Dispose()
        $script:Interval = $null
    }

    $script:AgentRunning = $false
    Write-Log "Agent stopped"
}

function Invoke-AutoMerge {
    Write-Log "Starting auto-merge process..."
    
    try {
        # Check and merge v1
        Test-AndMergeDirectory -SourceDir $script:V1Dir -Version "v1"
        
        # Check and merge v2
        Test-AndMergeDirectory -SourceDir $script:V2Dir -Version "v2"
        
        Write-Log "Auto-merge process completed successfully"
    } catch {
        Write-Log "Auto-merge process failed: $($_.Exception.Message)"
    }
}

function Get-AgentStatus {
    if ($script:AgentRunning) {
        Write-Log "Agent is running"
    } else {
        Write-Log "Agent is not running"
    }
}

# Main execution
if ($Start) {
    Start-AutoMerge
} elseif ($Stop) {
    Stop-AutoMerge
} elseif ($Status) {
    Get-AgentStatus
} elseif ($Test) {
    Write-Log "Running test merge..."
    Invoke-AutoMerge
} else {
    Write-Host "OAA Auto-Merge Agent"
    Write-Host "Usage:"
    Write-Host "  .\auto_merge_agent.ps1 -Start    # Start the agent"
    Write-Host "  .\auto_merge_agent.ps1 -Stop     # Stop the agent"
    Write-Host "  .\auto_merge_agent.ps1 -Status   # Check agent status"
    Write-Host "  .\auto_merge_agent.ps1 -Test     # Run a test merge"
}
