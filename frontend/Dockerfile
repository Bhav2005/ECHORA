FROM node:18-alpine

WORKDIR /app

# Install serve globally to host the static HTML
RUN npm install -g serve

# Copy only the static HTML file
COPY . .

EXPOSE 5173

CMD ["serve", ".", "-p", "5173", "--no-clipboard"]
