FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/nginx.conf.template
CMD ["/bin/sh", "-c", "\
envsubst '$PROXY_PROTOCOL $LENDING_SERVICE_URL $BOOK_SERVICE_URL $USER_SERVICE_URL $NOTIFICATION_SERVICE_URL' \
< /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf \
&& nginx -g 'daemon off;'"]
