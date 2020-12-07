Enforce timeout-minutes
=======================

Enforces setting timeout-minutes of the workflow jobs to prevent waste of minutes quota.

# Example


```yaml
name: Enforce timeout-minutes

on: push

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 2

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Self check
        id: enforces-timeout-minutes
        uses: komiya-atsushi/action-enforce-timeout-minutes@v1
```

# License

MIT License.

Copyright (c) 2020 KOMIYA Atsushi.

