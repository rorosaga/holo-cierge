FROM node:latest

RUN apt-get update && \
    apt-get install -y \
    git \
    wget \
    ffmpeg \
    unzip \
    python3 \
    python3-pip \
    python3-venv \
    yarn \
    && apt-get clean

RUN git clone https://github.com/rorosaga/holo-cierge.git /holo-cierge

WORKDIR /holo-cierge/concierge-backend

RUN echo "" > .env

RUN yarn install

RUN wget -P /tmp https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && unzip /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip -d /holo-cierge/concierge-backend \
    && rm /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && rm  -rf /holo-cierge/concierge-backend/bin \
    && mv /holo-cierge/concierge-backend/Rhubarb-Lip-Sync-1.13.0-Linux /holo-cierge/concierge-backend/bin

RUN python3 -m venv venv
RUN . venv/bin/activate && \
    pip install -U openai-whisper

EXPOSE 3000

CMD ["yarn", "dev"]
