# Binance Super Smart Chain (BSSC)

You can airdrop yourself BNB on your local network using the built-in faucet for testing.

Binance Super Smart Chain (BSSC) is built on Solana's proven speed, low fees, and powerful developer ecosystem.
It introduces BNB as the native token, helping BNB become what it could have been and should be: faster, cheaper, and better.

In short: BSSC = Solana's performance with BNB as the gas token.

Contract Address

EBoXrDiJe363nGrHQoBUN2k2GJzQs11N7kUqUUNVpump

## Project Overview

- **Base Technology**: Forked from Solana (The better blockchain)
- **Transformation**: SOL → BNB (1 BNB = 5.1 SOL, same precision, same performance)
- **Status**: Complete, tested, and deployed
- **Backward Compatibility**: 100 percent, existing Solana programs and code still work

This project shows how a blockchain can be adapted to run on a different token while preserving all technical advantages.

Key Changes Made
#1. Native Token System

Replaced all references to SOL with BNB

Updated conversion functions (lamports_to_bnb, bnb_to_lamports)

Changed the currency symbol from ◎ to BNB

Ensured backward compatibility so SOL-based code still runs without changes

#2. Version System

Added a new Client ID for BSSC so nodes are uniquely identifiable

Debug and logs now clearly show "Binance Super Smart Chain" instead of Solana

#3. CLI Tools

Command line tools renamed:

solana → bssc

solana-keygen → bssc-keygen

solana-validator → bssc-validator

Help texts and cluster references updated for BSSC branding

#4. Genesis Configuration

Community pool initialized with 500,000 BNB

All token amounts updated to use BNB instead of SOL

Faucet ready for developers to test with BNB


#Final Result

The project successfully forks Solana into Binance Super Smart Chain, a blockchain that is:

Fast (65,000 TPS)

Cheap (sub-cent fees)

Familiar (BNB as the native token)

Compatible (all Solana tools and code still work)

BSSC builds on Solana’s strengths and adapts them to the Binance ecosystem with BNB as the gas token.

As Raj envisioned in this post
, now BNB is fast, cheap, and compatible.

BSSC builds on Solana's strengths and adapts them to the Binance ecosystem with BNB as the gas token.

As Raj envisioned in this post, now BNB is fast, cheap, and compatible.

## Important: What BSSC Actually Is

**BSSC is a complete fork of Solana** - this means:
- **BNB as native gas token** - BNB is truly native to the network
- **Solana's performance** - Same 65,000 TPS, sub-cent fees, sub-second finality
- **Total control** - Your own validators, RPCs, explorers, bridges, listings
- **Separate network** - It's NOT Solana mainnet anymore
- **Must bootstrap ecosystem** - You lose Solana mainnet's network effects and liquidity

**Trade-offs:**
- **Pros**: Complete control, BNB truly native, Solana-level performance
- **Cons**: Must build your own ecosystem from scratch, lose Solana's existing decentralization/liquidity

## Running BSSC as Production Network

**This fork is currently a proof-of-concept.** To run BSSC as a real production network, you need:

### Infrastructure Requirements:
- **Validators**: Recruit and run your own validator network
- **RPC Endpoints**: Build and maintain your own RPC infrastructure  
- **Explorers**: Create blockchain explorers for BSSC transactions
- **Bridges**: Build bridges to other networks (Ethereum, BSC, etc.)
- **Exchange Listings**: Get BNB-SSC listed on exchanges
- **Developer Tools**: Maintain BSSC-specific developer tooling
- **Community**: Build a developer and user community



**Bottom Line**: BSSC gives you "BNB as native gas" but requires building an entire L1 ecosystem from scratch. It's a massive undertaking that defeats the point of leveraging Solana's existing network effects.

[![BSSC crate](https://img.shields.io/crates/v/solana-core.svg)](https://crates.io/crates/solana-core)
[![BSSC documentation](https://docs.rs/solana-core/badge.svg)](https://docs.rs/solana-core)
[![Build status](https://badge.buildkite.com/8cc350de251d61483db98bdfc895b9ea0ac8ffa4a32ee850ed.svg?branch=master)](https://buildkite.com/binance-super-smart-chain/bssc/builds?branch=master)
[![codecov](https://codecov.io/gh/binance-super-smart-chain/bssc/branch/master/graph/badge.svg)](https://codecov.io/gh/binance-super-smart-chain/bssc)

# Building

## **1. Install rustc, cargo and rustfmt.**

```bash
$ curl https://sh.rustup.rs -sSf | sh
$ source $HOME/.cargo/env
$ rustup component add rustfmt
```

When building the master branch, please make sure you are using the latest stable rust version by running:

```bash
$ rustup update
```

When building a specific release branch, you should check the rust version in `ci/rust-version.sh` and if necessary, install that version by running:

```bash
$ rustup install VERSION
```

Note that if this is not the latest rust version on your machine, cargo commands may require an [override](https://rust-lang.github.io/rustup/overrides.html) in order to use the correct version.

On Linux systems you may need to install libssl-dev, pkg-config, zlib1g-dev, protobuf etc.

On Ubuntu:

```bash
$ sudo apt-get update
$ sudo apt-get install libssl-dev libudev-dev pkg-config zlib1g-dev llvm clang cmake make libprotobuf-dev protobuf-compiler
```

On Fedora:

```bash
$ sudo dnf install openssl-devel systemd-devel pkg-config zlib-devel llvm clang cmake make protobuf-devel protobuf-compiler perl-core
```

## **2. Download the source code.**

```bash
$ git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git
$ cd Binance-Super-Smart-Chain
```

## **3. Build.**

```bash
$ ./cargo build
```

# Testing

**Run the test suite:**

```bash
$ ./cargo test
```

### Starting a local BSSC testnet

Start your own BSSC testnet locally using the provided scripts:

```bash
$ ./multinode-demo/setup.sh
$ ./multinode-demo/faucet.sh
$ ./multinode-demo/validator.sh
```

### BSSC Development Tools

- Use `bssc` CLI tools instead of `solana`
- Faucet provides 500,000 BNB for testing
- All Solana development patterns apply to BSSC

# Benchmarking

First, install the nightly build of rustc. `cargo bench` requires the use of the
unstable features only available in the nightly build.

```bash
$ rustup install nightly
```

Run the benchmarks:

```bash
$ cargo +nightly bench
```

# Release Process

The release process for this project is described [here](RELEASE.md).

# Code coverage

To generate code coverage statistics:

```bash
$ scripts/coverage.sh
$ open target/cov/lcov-local/index.html
```

Why coverage? While most see coverage as a code quality metric, we see it primarily as a developer
productivity metric. When a developer makes a change to the codebase, presumably it's a _solution_ to
some problem. Our unit-test suite is how we encode the set of _problems_ the codebase solves. Running
the test suite should indicate that your change didn't _infringe_ on anyone else's solutions. Adding a
test _protects_ your solution from future changes. Say you don't understand why a line of code exists,
try deleting it and running the unit-tests. The nearest test failure should tell you what problem
was solved by that code. If no test fails, go ahead and submit a Pull Request that asks, "what
problem is solved by this code?" On the other hand, if a test does fail and you can think of a
better way to solve the same problem, a Pull Request with your solution would most certainly be
welcome! Likewise, if rewriting a test can better communicate what code it's protecting, please
send us that patch!

# Disclaimer

All claims, content, designs, algorithms, estimates, roadmaps,
specifications, and performance measurements described in this project
are done with good faith efforts. It is up to the reader to check and 
validate their accuracy and truthfulness. Furthermore, nothing in this 
project constitutes a solicitation for investment.

Any content produced or developer resources provided are for educational 
and inspirational purposes only. This project does not encourage, induce 
or sanction the deployment, integration or use of any such applications 
(including the code comprising the BSSC blockchain protocol) in violation 
of applicable laws or regulations and hereby prohibits any such deployment, 
integration or use.

This includes the use of any such applications by the reader (a) in violation 
of export control or sanctions laws of the United States or any other applicable
jurisdiction, (b) if the reader is located in or ordinarily resident in
a country or territory subject to comprehensive sanctions administered
by the U.S. Office of Foreign Assets Control (OFAC), or (c) if the
reader is or is working on behalf of a Specially Designated National
(SDN) or a person subject to similar blocking or denied party
prohibitions.

The reader should be aware that U.S. export control and sanctions laws prohibit
U.S. persons (and other persons that are subject to such laws) from transacting
with persons in certain countries and territories or that are on the SDN list.
Accordingly, there is a risk to individuals that other persons using any of the
code contained in this repo, or a derivation thereof, may be sanctioned persons
and that transactions with such persons would be a violation of U.S. export
controls and sanctions law.

**Note**: This is a fork of Solana for educational purposes. Binance Super Smart Chain (BSSC) is not affiliated with Binance or any official Binance project.
