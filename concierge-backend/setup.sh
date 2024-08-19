#!/bin/bash
pwd
wget -P ~/Downloads https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip
echo "* Deleting Existing bin Directory"
rm -rf bin
echo "* Unpacking Rhubarb into back-end directory"
unzip ~/Downloads/Rhubarb-Lip-Sync-1.13.0-Linux.zip 
echo "* Renaming Rhubarb directory"
mv Rhubarb-Lip-Sync-1.13.0-macOS bin

echo "* Pre-processing Backend"
yarn

echo "* Installing ffmpeg"
sudo apt install -y ffmpeg

echo "* Installing Python"
sudo apt install -y python3 python3-venv python3-pip

echo "* Creating Python Virtual Environment"
python3 -m venv venv

echo "* Activating Python Virtual Environment"
source venv/bin/activate
pip install -U openai-whisper
#pip install numpy==1.26.4
sed -i -e 's/checkpoint = torch.load(fp, map_location=device)/checkpoint = torch.load(fp, map_location=device, weights_only=True)/' ./venv/lib/python3.10/site-packages/whisper/__init__.py
echo "* Creating Uploads and Audios Directory"
mkdir uploads
mkdir audios

echo "* Authorizing Rhubarb"
spctl --add ../concierge-backend/bin/rhubarb

echo "* Changing whisper model to base"
sed -i -e 's/model = whisper.load_model("tiny")/model = whisper.load_model("base")/' ../concierge-backend/transcribe.py
