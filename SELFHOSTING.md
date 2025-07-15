# Self-hosting guide

This is the self-hosting guide. It will show you how to set up your own compelete file-sharing server.

> [!NOTE]
> This project is tested with Docker Compose V2. Docker Compose V1 will most likely fail to build.

## Setting up

### Quick Transfers

1. Run `./createenv.sh` to create the env-files needed.

### Stored Transfers

To set up Stored Transfers, you need to spin up a [node server](https://github.com/robinkarlberg/transfer.zip-node) and configure it. The node server handles all file operations.

Having seperate servers handling the heavy-duty stuff like uploads and zip bundles, keeps the main site running smoothly. It also enables distributing of several node servers around the world, close to users, to optimize download times.

1. Run the main worker once, `docker compose up worker`, until the public key appears. Save this key for later.
2. Clone the [transfer.zip-node](https://github.com/robinkarlberg/transfer.zip-node) repo, on the same machine or any other machine with internet connection. 
3. Run `./createenv.sh` in the new repo, to create the env-files needed.
4. **If you want to use S3 for file storage**: Edit `server/conf.json` with your acess keys, and change the `active` provider to the new provider name.
5. **If you want to use the built-in caddy**: Edit `.env` and add your domain and email for automatic SSL certificates.
6. Create a `./keys/public.pem` file and paste the public key you got from the main worker server. 
7. Deploy the new node server using `docker compose` or the `./deploy-caddy.sh` script.
8. Back to your main repo, change the `next/conf.json` to include the public url to your new node server.
<!-- 9. **If you want to use custom branded transfers**:  -->

## Deploying

There are multiple ways to deploy Transfer.zip, the easiest is to use the built-in caddy config. If you want more control, you can use any reverse proxy. (Examples provided)

### Caddy (built-in)

Transfer.zip comes with a Caddy conf built-in. Run the caddy deploy script to use the `docker-compose.caddy.yml` override.
```
./deploy-caddy.sh
```

> [!WARNING]
> The Caddy container listens by default on `0.0.0.0`. Make sure to firewall it if you don't want to expose it to the internet.


### Any other reverse-proxy

```
docker compose up --build -d
```

**Apache**
For Apache, the configuration needs to include these lines for the reverse proxy to function:
```
ProxyPreserveHost On

ProxyPass /ws ws://localhost:9002/
ProxyPassReverse /ws ws://localhost:9002/

ProxyPass / http://localhost:9001/
ProxyPassReverse / http://localhost:9001/
```

**NGINX**
For NGINX:
```
# Put this at the top
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Put this in your server-block
# server {
# ...
    location /ws {
        proxy_pass http://localhost:9001/ws;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }
# ...
# }
```