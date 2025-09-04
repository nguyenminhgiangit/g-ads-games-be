#!/bin/bash

PROTO_DIR=./protos
OUT_DIR=./src/generated

mkdir -p $OUT_DIR

# npx protoc \
protoc \
  --plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=$OUT_DIR \
  --ts_proto_opt=outputServices=grpc-js,useExactTypes=false \
  -I $PROTO_DIR $PROTO_DIR/*.proto
