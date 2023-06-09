# !/bin/bash

# FOR CLOUDFLARE PAGES BUILD

echo $CF_PAGES_BRANCH

if [[ $CF_PAGES_BRANCH =~ "mainnet" ]]; then
    REACT_APP_ENVIRONMENT=jfin pnpm build
elif [[ $CF_PAGES_BRANCH =~ "testnet" ]]; then
    REACT_APP_ENVIRONMENT=jfintest pnpm build
else
    echo Error : network not found in branch name
    exit 1
fi