#!/bin/bash

BENCHMARK=eth-transfers yarn benchmark
BENCHMARK=erc20-transfers yarn benchmark
BENCHMARK=erc20-deploys yarn benchmark
BENCHMARK=erc20-calls yarn benchmark
BENCHMARK=erc20-storage yarn benchmark
BENCHMARK=many-storage yarn benchmark
