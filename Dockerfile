FROM node:4-onbuild

WORKDIR /home/helpmate

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower

# Install Mean.JS packages
ADD package.json /home/helpmate/package.json
RUN npm install

# Manually trigger bower. Why doesnt this work via npm install?
ADD .bowerrc /home/helpmate/.bowerrc
ADD bower.json /home/helpmate/bower.json
RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /home/helpmate

# Set development environment as default
ENV NODE_ENV development

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["grunt"]
