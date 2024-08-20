FROM node:latest

RUN apt-get update && \
    apt-get install -y \
    git \
    yarn \
    && apt-get clean

RUN git clone https://github.com/rorosaga/holo-cierge.git /holo-cierge

WORKDIR /holo-cierge/concierge-frontend

RUN yarn install

EXPOSE 5173

CMD ["yarn", "dev", "--host"]