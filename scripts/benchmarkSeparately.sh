#!/bin/bash

INITIAL_STATE=dirty BENCHMARK=eth-transfers yarn start
INITIAL_STATE=dirty BENCHMARK=erc20-transfers yarn start
INITIAL_STATE=dirty BENCHMARK=erc20-deploys yarn start
INITIAL_STATE=dirty BENCHMARK=erc20-calls yarn start
INITIAL_STATE=dirty BENCHMARK=erc20-storage yarn start
INITIAL_STATE=dirty BENCHMARK=many-storage yarn start
