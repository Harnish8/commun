#!/usr/bin/env bash
set -e

pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ --trusted-host d33sy5i8bnduwe.cloudfront.net

pip install -r backend/requirements.txt