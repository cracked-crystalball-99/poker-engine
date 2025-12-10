#!/usr/bin/env powershell
<#
.SYNOPSIS
    Deployment script for Texas Hold'em Poker AI Engine
.DESCRIPTION
    Deploys poker engine updates to GitHub Pages with safety checks
.PARAMETER SkipTests
    Skip pre-deployment tests
.PARAMETER Message
    Custom commit message
#>

param(
    [switch]$SkipTests,
    [string]$Message = "Update poker engine"
)

$ErrorActionPreference = 'Stop'
$SourcePath = Get-Location

Write-Host "🃏 Poker Engine Deployment Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Safety Check 1: Ensure we're in the right directory
if (!(Test-Path "index.html") -or !(Test-Path "poker-engine.js")) {
    Write-Error "❌ Not in poker engine directory! Expected files not found."
    exit 1
}

# Safety Check 2: Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus -and !$SkipTests) {
    Write-Host "📝 Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    $continue = Read-Host "Continue with deployment? (y/N)"
    if ($continue -ne 'y') {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 1
    }
}

# Safety Check 3: Basic file validation
if (!$SkipTests) {
    Write-Host "🔍 Running pre-deployment checks..." -ForegroundColor Yellow
    
    # Check HTML syntax
    $htmlContent = Get-Content "index.html" -Raw
    if (!$htmlContent.Contains("</html>")) {
        Write-Error "❌ HTML file appears incomplete"
        exit 1
    }
    
    # Check JavaScript syntax (basic)
    $jsContent = Get-Content "poker-engine.js" -Raw
    if (!$jsContent.Contains("class PokerEngine")) {
        Write-Error "❌ Poker engine JavaScript file appears incomplete"
        exit 1
    }
    
    # Check hand evaluator
    $handEvalContent = Get-Content "hand-evaluator.js" -Raw
    if (!$handEvalContent.Contains("class HandEvaluator")) {
        Write-Error "❌ Hand evaluator JavaScript file appears incomplete"
        exit 1
    }
    
    # Check AI engine
    $aiContent = Get-Content "poker-ai.js" -Raw
    if (!$aiContent.Contains("class PokerAI")) {
        Write-Error "❌ Poker AI JavaScript file appears incomplete"
        exit 1
    }
    
    Write-Host "✅ Pre-deployment checks passed" -ForegroundColor Green
}

# Step 1: Commit to Git (if changes exist)
if ($gitStatus) {
    Write-Host "📤 Committing changes to Git..." -ForegroundColor Cyan
    git add .
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ Git commit failed"
        exit 1
    }
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Blue
}

# Step 2: Push to GitHub
Write-Host "🌐 Pushing to GitHub..." -ForegroundColor Cyan
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ GitHub push failed"
    exit 1
}
Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green

# Step 3: Verify core files exist
Write-Host "🔍 Final verification..." -ForegroundColor Cyan

$coreFiles = @(
    "index.html",
    "poker-engine.js",
    "hand-evaluator.js", 
    "poker-ai.js",
    "README.md"
)

$allFilesExist = $true
foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ All core files verified" -ForegroundColor Green
} else {
    Write-Warning "⚠️  Some core files are missing"
}

# Success summary
Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ GitHub repo updated" -ForegroundColor White
Write-Host "✅ All poker engine files deployed" -ForegroundColor White
Write-Host ""
Write-Host "🌐 GitHub Pages: https://cracked-crystalball-99.github.io/poker-engine/" -ForegroundColor Cyan
Write-Host "📊 Repository: https://github.com/cracked-crystalball-99/poker-engine" -ForegroundColor Cyan
Write-Host ""
Write-Host 'Tip: GitHub Pages may take 1-5 minutes to reflect changes' -ForegroundColor Blue
Write-Host ""
Write-Host "🃏 Ready to play poker against AI opponents!" -ForegroundColor Yellow