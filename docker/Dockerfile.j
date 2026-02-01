# J Language Sandbox Container
# Secure, isolated environment for executing J code

FROM debian:bookworm-slim

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libreadline8 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for running code
RUN useradd -m -s /bin/bash sandbox && \
    chown -R sandbox:sandbox /home/sandbox

# Download and install J
WORKDIR /home/sandbox
RUN curl -L -o j.tar.gz "https://www.jsoftware.com/download/j9.6/install/j9.6_linux64.tar.gz" && \
    tar xzf j.tar.gz && \
    rm j.tar.gz && \
    chown -R sandbox:sandbox j9.6

# Set up environment
ENV PATH="/home/sandbox/j9.6/bin:${PATH}"
ENV HOME="/home/sandbox"

# Switch to sandbox user
USER sandbox
WORKDIR /home/sandbox

# Entry point - read code from stdin and execute
ENTRYPOINT ["/home/sandbox/j9.6/bin/jconsole"]
