<# Calls the JavaScript tests with minimal output to save LLM tokens. #>

param(
    [switch]$Stacktrace
)

$gradleArgs = @('--console=plain', '-q', 'jsTestQuiet')

if ($Stacktrace)
{
    $gradleArgs += '-PjsTestStacktrace=true'
}

$output = & "$PSScriptRoot\gradlew.bat" @gradleArgs 2>&1
$exitCode = $LASTEXITCODE
$printedSummary = $false

foreach ($line in $output)
{
    $text = [string]$line

    if ([string]::IsNullOrWhiteSpace($text))
    {
        continue
    }

    if ($text -match '^(\d+) tests completed, (\d+) failed$')
    {
        if (-not $printedSummary)
        {
            Write-Output $text
            $printedSummary = $true
        }
        continue
    }

    if ($text -eq 'OK')
    {
        Write-Output $text
        continue
    }

    if ($text -match '^FAILED: ')
    {
        Write-Output $text
        continue
    }

    if ($text -match '^FAILURE: Build failed with an exception\.$')
    {
        continue
    }

    if ($text -match '^\* Where:$')
    {
        continue
    }

    if ($text -match '^\* What went wrong:$')
    {
        continue
    }

    if ($text -match '^\* Try:$')
    {
        continue
    }

    if ($text -match '^> Run with --stacktrace option to get the stack trace\.$')
    {
        continue
    }

    if ($text -match '^> Run with --info or --debug option to get more log output\.$')
    {
        continue
    }

    if ($text -match '^> Run with --scan to get full insights into the build\.$')
    {
        continue
    }

    if ($text -match '^> Get more help at https://help\.gradle\.org\.$')
    {
        continue
    }

    if ($text -match "^Execution failed for task '.*'.*$")
    {
        continue
    }

    if ($text -match '^> Tests failed\.$')
    {
        continue
    }

    if ($text -match '^BUILD FAILED in .+$')
    {
        continue
    }

    if ($Stacktrace)
    {
        Write-Output $text
    }
}

exit $exitCode
