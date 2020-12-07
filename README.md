Enforce timeout-minutes
=======================

Enforces setting timeout-minutes of the workflow jobs to prevent waste of minutes quota.

# Example


```yaml
name: Enforce timeout-minutes

on: push

jobs:
  enforce-timeout-minutes:
    runs-on: ubuntu-latest
    timeout-minutes: 2

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Enforce timeout-minutes
        uses: komiya-atsushi/action-enforce-timeout-minutes@v1.0.0
```

# License

MIT License.

Copyright (c) 2020 KOMIYA Atsushi.

