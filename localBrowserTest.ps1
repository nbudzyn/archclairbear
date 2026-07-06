<# Calls the browser tests with Playwright. #>

$gradleArgs = @('--console=plain', '-q', 'browserTest')

& "$PSScriptRoot\gradlew.bat" @gradleArgs
exit $LASTEXITCODE
