# !/bin/bash

# FOR CLOUDFLARE PAGES BUILD

if [ "$CF_PAGES_BRANCH" == *"mainnet"* ]; then
    pnpm build:jfin
elif [ "$CF_PAGES_BRANCH" == *"testnet"* ]; then
    pnpm build:jfintest
else
    echo Error : network not found in branch name
    exit 1
fi