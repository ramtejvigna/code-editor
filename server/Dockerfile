# # Base Image
# FROM ubuntu:latest

# # Install required languages
# RUN apt-get update && apt-get install -y docker.io \
#     python3 python3-pip \
#     nodejs npm \
#     g++ openjdk-17-jdk \
#     && apt clean

# # Set working directory
# WORKDIR /sandbox

# # Default command
# CMD ["/bin/bash"]

# Use the existing code-sandbox image as the base
FROM code-sandbox

WORKDIR /sandbox

COPY . /sandbox

RUN if [ -f "package.json" ]; then npm install; fi

EXPOSE 5000

CMD ["node", "server.js"]