#!/bin/bash
# GCP Deployment Script for AppointEase

# Exit on any error
set -e

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is required but not installed. Please install Docker first."
    exit 1
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Google Cloud SDK (gcloud) is required but not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to gcloud
if ! gcloud auth print-identity-token &> /dev/null; then
    echo "You need to log in to Google Cloud first. Run 'gcloud auth login'."
    exit 1
fi

# Set default variables
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
REGION="southamerica-west1"  # Default region, change if needed
SERVICE_NAME="appointease"
TAG=$(date +%Y%m%d-%H%M%S)
IMAGE_NAME="appointease:$TAG"

# Prompt for variables if not set
if [ -z "$PROJECT_ID" ]; then
    echo "Enter your Google Cloud Project ID:"
    read PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

echo "Using Google Cloud Project: $PROJECT_ID"
echo "Using Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Image Tag: $TAG"

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Tag the image for Google Container Registry/Artifact Registry
REGISTRY_URL="$REGION-docker.pkg.dev/$PROJECT_ID/containers"
FULL_IMAGE_NAME="$REGISTRY_URL/$IMAGE_NAME"

echo "Tagging image as $FULL_IMAGE_NAME"
docker tag $IMAGE_NAME $FULL_IMAGE_NAME

# Configure docker to use gcloud credentials
echo "Configuring Docker authentication..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# Push the image to Google Container Registry/Artifact Registry
echo "Pushing image to Google Artifact Registry..."
docker push $FULL_IMAGE_NAME

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $FULL_IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest

echo "Deployment completed! Your application should be available at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"