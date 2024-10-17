FROM node:20

RUN rm /etc/localtime \
  && echo "Asia/Tokyo" > /etc/timezone \
  && dpkg-reconfigure -f noninteractive tzdata
RUN echo `cat /etc/passwd | grep 1000`

RUN userdel node

ARG UID=1000
ARG GID=1000

RUN groupadd saitokoh -g $GID \
  && useradd -m saitokoh -u $UID -g $GID

RUN mkdir -p /home/saitokoh/app \
  && mkdir -p /home/saitokoh/init \
  && mkdir -p /home/saitokoh/.npm-global \
  && chown -R saitokoh:saitokoh /home/saitokoh

USER saitokoh

ENV NPM_CONFIG_PREFIX=/home/saitokoh/.npm-global
ENV PATH=$PATH:/home/saitokoh/.npm-global/bin

WORKDIR /home/saitokoh/app

COPY --chown=saitokoh:saitokoh package*.json ./
RUN npm install

COPY --chown=saitokoh:saitokoh . .

CMD ["bash"]