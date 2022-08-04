FROM node:alpine

# Update
RUN apk add --update nodejs

COPY ./src /rest_api_base

WORKDIR /rest_api_base

# Install app dependencies
RUN npm install

CMD ["npm", "start"]
