FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y \
    git \
    wget \
    unzip \
    python3 \
    python3-pip \
    python3-venv \
    yarn \
    && apt-get clean

RUN git clone https://github.com/rorosaga/holo-cierge.git /holo-cierge

WORKDIR /holo-cierge/concierge-backend

RUN wget -P /tmp https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && unzip /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip -d /holo-cierge/concierge-backend \
    && rm /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip \
    && rm  -rf /holo-cierge/concierge-backend/bin \
    && mv /holo-cierge/concierge-backend/Rhubarb-Lip-Sync-1.13.0-Linux /holo-cierge/concierge-backend/bin \
    && chmod +x /holo-cierge/concierge-backend/bin/rhubarb \
    && /holo-cierge/concierge-backend/bin/rhubarb --version


RUN echo "OPENAI_API_KEY=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\n\
ELEVEN_LABS_API_KEY=sk_cb8fb74dfe5a49170b3c2239c8cf9dd52c2be0839a626ed1\n\
RHUBARB_PATH=./bin/rhubarb" > .env

RUN python3 -m venv venv && \
    . venv/bin/activate && \
    pip install -U openai-whisper
    