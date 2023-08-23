# Setting up nostr relayy

---

ssh -i <path to private key>.pem nf_relay_user@<ip address>

---

## Gotchas

- Have to set the A record for the domain

- The include the $USER into the docker group

`sudo usermod -aG docker $USER`

- Restart the server

---

# BEGIN INSTALLATION HERE

# Update deps

sudo apt update

# Install nodejs, npm, nginx, certbot

sudo apt install nodejs npm nginx certbot python3-certbot-nginx

# Setup Docker GPG key

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Setup `apt` Docker repository

echo \
 "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
 $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker

sudo chmod a+r /etc/apt/keyrings/docker.gpg
sudo apt update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Check installation is successful by checking verions

docker --version
npm --version
node --version

# Clone `nostream` repo

git clone https://github.com/Cameri/nostream.git

# Delete the default nginx settings file

rm -rf /etc/nginx/sites-available/default

# Paste in new settings file contents (see heading NGINX SETTINGS below)

sudo nano /etc/nginx/sites-available/default

# Restart nginx

sudo service nginx restart

# Map DNS A record to IP of VM machine (see DNS SETTINGS below)

# Request SSL cert from letsencrypt/certbot

sudo certbot --nginx -d subdomain.mydomain.com

# Open a TMUX session (to be able to detach and maintain process running)

tmux

# Start the relay

npm run docker:compose:start

# To detach from the TMUX session

Ctrl+B + D

# To re-attach to the TMUX session

tmux a
