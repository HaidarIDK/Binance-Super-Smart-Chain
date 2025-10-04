#!/usr/bin/env bash

here=$(dirname "$0")
# shellcheck source=multinode-demo/common.sh
source "$here"/common.sh

set -e

rm -rf "$BSSC_CONFIG_DIR"/bootstrap-validator
mkdir -p "$BSSC_CONFIG_DIR"/bootstrap-validator

# Create genesis ledger
if [[ -r $FAUCET_KEYPAIR ]]; then
  cp -f "$FAUCET_KEYPAIR" "$BSSC_CONFIG_DIR"/faucet.json
else
  $bssc_keygen new --no-passphrase -fso "$BSSC_CONFIG_DIR"/faucet.json
fi

if [[ -f $BOOTSTRAP_VALIDATOR_IDENTITY_KEYPAIR ]]; then
  cp -f "$BOOTSTRAP_VALIDATOR_IDENTITY_KEYPAIR" "$BSSC_CONFIG_DIR"/bootstrap-validator/identity.json
else
  $bssc_keygen new --no-passphrase -so "$BSSC_CONFIG_DIR"/bootstrap-validator/identity.json
fi
if [[ -f $BOOTSTRAP_VALIDATOR_STAKE_KEYPAIR ]]; then
  cp -f "$BOOTSTRAP_VALIDATOR_STAKE_KEYPAIR" "$BSSC_CONFIG_DIR"/bootstrap-validator/stake-account.json
else
  $bssc_keygen new --no-passphrase -so "$BSSC_CONFIG_DIR"/bootstrap-validator/stake-account.json
fi
if [[ -f $BOOTSTRAP_VALIDATOR_VOTE_KEYPAIR ]]; then
  cp -f "$BOOTSTRAP_VALIDATOR_VOTE_KEYPAIR" "$BSSC_CONFIG_DIR"/bootstrap-validator/vote-account.json
else
  $bssc_keygen new --no-passphrase -so "$BSSC_CONFIG_DIR"/bootstrap-validator/vote-account.json
fi

args=(
  "$@"
  --max-genesis-archive-unpacked-size 1073741824
  --enable-warmup-epochs
  --bootstrap-validator "$BSSC_CONFIG_DIR"/bootstrap-validator/identity.json
                        "$BSSC_CONFIG_DIR"/bootstrap-validator/vote-account.json
                        "$BSSC_CONFIG_DIR"/bootstrap-validator/stake-account.json
)

"$SOLANA_ROOT"/fetch-spl.sh
if [[ -r spl-genesis-args.sh ]]; then
  SPL_GENESIS_ARGS=$(cat "$SOLANA_ROOT"/spl-genesis-args.sh)
  #shellcheck disable=SC2207
  #shellcheck disable=SC2206
  args+=($SPL_GENESIS_ARGS)
fi

default_arg --ledger "$BSSC_CONFIG_DIR"/bootstrap-validator
default_arg --faucet-pubkey "$BSSC_CONFIG_DIR"/faucet.json
default_arg --faucet-lamports 500000000000000000
default_arg --hashes-per-tick auto
default_arg --cluster-type development

$bssc_genesis "${args[@]}"
