FROM node:18-bullseye

# Set the working directory
WORKDIR /app

# Install Python and python3-venv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create a virtual environment and make sure the python command points to it
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy python requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend package.json and install
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy everything else
COPY . .

# Expose port
EXPOSE 5000

# Set the working directory to backend
WORKDIR /app/backend

# Start the Node.js server
CMD ["node", "server.js"]
