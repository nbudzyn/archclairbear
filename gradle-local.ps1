<# Runs Gradle with a project-local user home. #>

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$GradleArgs
)

$env:GRADLE_USER_HOME = Join-Path $PSScriptRoot '.gradle-user'
New-Item -ItemType Directory -Force -Path $env:GRADLE_USER_HOME | Out-Null

& "$PSScriptRoot\gradlew.bat" @GradleArgs
exit $LASTEXITCODE
