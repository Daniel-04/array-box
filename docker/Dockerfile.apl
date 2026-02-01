# Dyalog APL Sandbox Container
# Secure, isolated environment for executing APL code
#
# NOTE: Dyalog APL requires a license. This Dockerfile assumes you have
# Dyalog installed on your host and will mount it into the container.
# The installation will be mounted at /opt/dyalog at runtime.

FROM debian:bookworm-slim

# Install runtime dependencies for Dyalog
RUN apt-get update && apt-get install -y --no-install-recommends \
    libncurses6 \
    libtinfo6 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for running code
RUN useradd -m -s /bin/bash sandbox && \
    mkdir -p /home/sandbox && \
    chown -R sandbox:sandbox /home/sandbox

# Set up environment
ENV HOME="/home/sandbox"
ENV DYALOG_NOPOPUPS="1"

# Switch to sandbox user
USER sandbox
WORKDIR /home/sandbox

# The Dyalog executable will be mounted at runtime
# Use mapl (the batch/script runner) instead of dyalog
ENTRYPOINT ["/opt/dyalog/mapl"]
