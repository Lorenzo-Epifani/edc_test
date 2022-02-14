FROM node:12.13.0-alpine
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait
RUN mkdir -p /opt/app
WORKDIR ./
RUN adduser -S app
COPY . .
RUN npm install
RUN chown -R app /opt/app
USER app
EXPOSE 3000
# Comando lanciato all' avvio del container
CMD [ "npm", "run", "start" ]  