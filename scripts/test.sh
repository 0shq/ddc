#!/bin/bash

# Run tests with coverage
jest --coverage --verbose

# Check test coverage thresholds
if [ $? -eq 0 ]; then
    echo "Tests passed successfully!"
    
    # Check coverage thresholds
    coverage_file="coverage/coverage-summary.json"
    if [ -f "$coverage_file" ]; then
        statements=$(jq '.total.statements.pct' "$coverage_file")
        branches=$(jq '.total.branches.pct' "$coverage_file")
        functions=$(jq '.total.functions.pct' "$coverage_file")
        lines=$(jq '.total.lines.pct' "$coverage_file")
        
        echo "Coverage Report:"
        echo "Statements: $statements%"
        echo "Branches: $branches%"
        echo "Functions: $functions%"
        echo "Lines: $lines%"
        
        # Check if coverage meets thresholds
        if (( $(echo "$statements < 80" | bc -l) )) || \
           (( $(echo "$branches < 80" | bc -l) )) || \
           (( $(echo "$functions < 80" | bc -l) )) || \
           (( $(echo "$lines < 80" | bc -l) )); then
            echo "Coverage is below 80% threshold!"
            exit 1
        fi
        
        echo "Coverage meets all thresholds!"
    else
        echo "Coverage file not found!"
        exit 1
    fi
else
    echo "Tests failed!"
    exit 1
fi 