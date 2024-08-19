#!/bin/bash

# Download Rhubarb Lip Sync using curl
echo "* Downloading Rhubarb Lip Sync"
curl -L -o /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip

# Delete existing bin directory if it exists
echo "* Deleting Existing bin Directory"
rm -rf bin

# Unpack Rhubarb into the bin directory
echo "* Unpacking Rhubarb into bin directory"
unzip /tmp/Rhubarb-Lip-Sync-1.13.0-Linux.zip -d bin

# Make Rhubarb executable
echo "* Making Rhubarb executable"
chmod +x bin/rhubarb

# Install ffmpeg using a static binary
echo "* Installing ffmpeg"
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-i686-static.tar.xz | tar -xJ
mv ffmpeg-*-static/ffmpeg bin/ffmpeg
mv ffmpeg-*-static/ffprobe bin/ffprobe
rm -rf ffmpeg-*-static

# Create Python Virtual Environment
echo "* Creating Python Virtual Environment"
python3 -m venv venv

# Activate Python Virtual Environment
echo "* Activating Python Virtual Environment"
source venv/bin/activate

# Install Whisper
echo "* Installing Whisper"
pip install -U openai-whisper

# Optional: Fix Whisper if needed
# echo "* Applying Whisper Patch"
# sed -i -e 's/checkpoint = torch.load(fp, map_location=device)/checkpoint = torch.load(fp, map_location=device, weights_only=True)/' ./venv/lib/python3.10/site-packages/whisper/__init__.py

# Change Whisper model to base
echo "* Changing Whisper model to base"
sed -i -e 's/model = whisper.load_model("tiny")/model = whisper.load_model("base")/' ../concierge-backend/transcribe.py

echo "* Setup complete"
