FROM node:20

WORKDIR /usr/src/app
COPY package.json ./

# Add "type": "module" automatically (if not present in your package.json)
RUN npm pkg set type=module

RUN npm install && npm install -g qrcode-terminal pm2
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
