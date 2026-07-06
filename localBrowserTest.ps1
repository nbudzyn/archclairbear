<# Calls the browser tests with minimal output to save LLM tokens. #>

param(
    [switch]$Stacktrace
)

$gradleArgs = @('--console=plain', '-q', 'browserTestQuiet')

if ($Stacktrace)
{
    $gradleArgs += '-PbrowserTestStacktrace=true'
}

& "$PSScriptRoot\gradlew.bat" @gradleArgs
exit $LASTEXITCODE
