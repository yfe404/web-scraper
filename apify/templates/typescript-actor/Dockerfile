# Use Apify's official Playwright image
FROM apify/actor-node-playwright-chrome:20

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Start command
CMD npm start
