#!/bin/bash
# GCP Deployment Script for AppointEase

# Exit on any error
set -e

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
    
# Prompt for variables if not set
if [ -z "$PROJECT_ID" ]; then
    echo "Enter your Google Cloud Project ID:"
    read PROJECT_ID
    gcloud config set project $PROJECT_ID
fi

gcloud config set project $PROJECT_ID

echo "Using Google Cloud Project: $PROJECT_ID"
echo "Using Region: $REGION"
echo "Service Name: $SERVICE_NAME"


# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME --source . --region $REGION --platform managed --allow-unauthenticated --port 8080 \
  --set-env-vars=NODE_ENV=production \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest

echo "Deployment completed! Your application should be available at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"