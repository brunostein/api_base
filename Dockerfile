FROM node:alpine

# Update
RUN apk add --update nodejs

WORKDIR /api_base

# Bundle app source
ADD ./src /api_base

# Install app dependencies
RUN npm install

CMD ["npm", "start"]
