# Documentation for DynamoDB

## Overview

## Tables

### FunctionExecutionCounter

### FunctionUrl

Do to the partition and sort key layout I will combine strings to a single key.

This results into the `uFunctionId` and the `pregion`.

`uFunctionId` = `{username}:{functionId}`\
`pregion` = `{provider}-{region}`

Due to that optimization we are able to quick key-value lookups compared to expensive queries.
