# Copyright 2016, EMC, Inc.
ARG repo=zdh
ARG tag=1.0

FROM ${repo}/on-core:${tag}

COPY . /RackHD/on-tasks/
COPY ./source.list /RackHD/

#RUN printf "deb http://archive.debian.org/debian/ jessie main\ndeb-src http://archive.debian.org/debian/ jessie main\ndeb http://security.debian.org jessie/updates main\ndeb-src http://security.debian.org jessie/updates main" > /etc/apt/sources.list

RUN cd /RackHD/on-tasks \
  && mkdir -p /RackHD/on-tasks/node_modules \
  && npm install --ignore-scripts --production \
  && rm -r /RackHD/on-tasks/node_modules/on-core \
  && rm -r /RackHD/on-tasks/node_modules/di \
  && ln -s /RackHD/on-core /RackHD/on-tasks/node_modules/on-core \
  && ln -s /RackHD/on-core/node_modules/di /RackHD/on-tasks/node_modules/di \
  && dpkg --remove-architecture  amd64 \
  && echo " " > /etc/apt/sources.list \
  && echo "deb http://mirrors.aliyun.com/debian jessie main" >> /etc/apt/sources.list \
  && echo "deb http://mirrors.aliyun.com/debian jessie-updates main" >> /etc/apt/sources.list \
  && apt-get clean \
  && apt-get update \
  && apt-get install -y apt-utils ipmitool openipmi
