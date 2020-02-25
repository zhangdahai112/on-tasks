# Copyright 2016, EMC, Inc.
ARG repo=zdh
ARG tag=2.0

FROM ${repo}/on-tasks:${tag}

COPY . /RackHD/on-tasks/