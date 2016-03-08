# node-triton-tags

This package defines and provides functions for parsing and validating "Triton
tags" -- special structure `triton.*` tags on instances (a.k.a. containers,
VMs) in [Joyent's Triton](https://www.joyent.com/triton). It exists mainly to
share Triton tag processing between the core
[sdc-docker](https://github.com/joyent/sdc-docker) and
[VMAPI](https://github.com/joyent/sdc-vmapi) services in Triton.


## Install

    npm install triton-tags


## Development Hooks

Before commiting be sure to, at least:

    make check      # lint and style checks
    make test       # run unit tests

A good way to do that is to install the stock pre-commit hook in your
clone via:

    make git-hooks

Also please run the full (longer) test suite (`make test`). See the next
section.


## Test suite

    make test


## License

MPL 2.0
