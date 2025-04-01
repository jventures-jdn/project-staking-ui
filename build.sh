# !/bin/bash

# FOR CLOUDFLARE PAGES BUILD

echo $CF_PAGES_BRANCH

if [[ $CF_PAGES_BRANCH =~ "legacy" ]]; then
    # STAKING 
    if [[ $CF_PAGES_BRANCH =~ "release" ]]; then
        if [[ $CF_PAGES_BRANCH =~ "devnet" ]]; then
            # testnet
            pnpm -C apps/staking-web build:jfintest --outDir=../../dist/output/static
        else
            # mainnet
            pnpm -C apps/staking-web build:jfin --outDir=../../dist/output/static
        fi
    else
        if [[ $CF_PAGES_BRANCH =~ "devnet" ]]; then
            # testnet
            pnpm -C apps/staking-web build:jfintest:preview  --outDir=../../dist/output/static
        else
            # mainnet
            pnpm -C apps/staking-web build:jfin:preview --outDir=../../dist/output/static
        fi
    fi
else
     echo Error : project not support
     exit 1
fi