#!/bin/bash

cd signaling-server/ && npm start 2>&1 &
cd frontend/ && npm start