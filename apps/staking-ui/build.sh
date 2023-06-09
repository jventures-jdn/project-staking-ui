# !/bin/bash

# FOR CLOUDFLARE PAGES BUILD

echo $CF_PAGES_BRANCH

if [[ $CF_PAGES_BRANCH == "release/mainnet" ]]; then
    PROD_MODE=1 NETWORK=jfin pnpm build
elif [[ $CF_PAGES_BRANCH == "release/testnet" ]]; then
    PROD_MODE=1 NETWORK=jfintest pnpm build
elif [[ $CF_PAGES_BRANCH =~ "mainnet" ]]; then
    NETWORK=jfin pnpm build
elif [[ $CF_PAGES_BRANCH =~ "testnet" ]]; then
    NETWORK=jfintest pnpm build
else
    echo Error : network not found in branch name
    exit 1
fi