# PowerShell version of commit message generator
param(
    [string]$Root = (git rev-parse --show-toplevel 2>$null)
)

# Detect scope from staged files
function Get-Scope {
    $files = git diff --cached --name-only --diff-filter=ACM 2>$null
    if (-not $files) { return "" }
    
    # Simple scope detection based on file paths
    if ($files -match "^reflections/") { return "reflections" }
    if ($files -match "^app/") { return "api" }
    if ($files -match "^tests/") { return "test" }
    if ($files -match "^scripts/") { return "build" }
    if ($files -match "^\.github/") { return "ci" }
    if ($files -match "^docs/") { return "docs" }
    if ($files -match "\.(py|js|ts)$") { return "code" }
    if ($files -match "\.(md|rst)$") { return "docs" }
    
    return ""
}

# Get staged diff
$diff = git diff --cached -U0 2>$null
if (-not $diff) {
    $scope = Get-Scope
    if ($scope) {
        Write-Output "chore($scope): update"
    } else {
        Write-Output "chore: update"
    }
    exit 0
}

# Detect scope
$scope = Get-Scope

# Type hints from file types
$typeHint = ""
if ($files -match "\.test\.(js|ts|py)$") { $typeHint = "Prefer type: test" }
if ($files -match "package\.json|pyproject\.toml|Dockerfile|^\.github/") { 
    $typeHint += "`nPrefer type: build/ci" 
}

# Build prompt
$prompt = @"
You are an expert at Conventional Commits.
Given a unified diff, produce a concise commit message:

Rules:
- Format: type(scope): subject
- Use this scope if provided: $($scope -or '<infer>')
- Subject ≤ 72 chars, imperative mood
- Add 0-3 bullet points only if truly helpful
- No trailing period
- Common types: feat, fix, refactor, chore, docs, test, build, ci, perf, style

$typeHint

Return ONLY the final commit text.

DIFF:
$diff
"@

# Try to call Ollama
try {
    $model = $env:MODEL
    if (-not $model) { $model = "llama3" }
    
    $msg = $prompt | ollama run $model 2>$null
    $msg = $msg.Trim()
    
    if ([string]::IsNullOrWhiteSpace($msg)) {
        throw "Empty response"
    }
} catch {
    # Fallback
    if ($scope) {
        $msg = "chore($scope): update"
    } else {
        $msg = "chore: update"
    }
}

Write-Output $msg
