# Comfort Companion

**Note: This project is deprecated due to Twilio shutting down the Autopilot service.**

Comfort Companion is an AI-based mental health textline designed to increase accessibility to resources. It uses Twilio Autopilot along with a MySQL database to store and provide mental health resources.

## Overview

Comfort Companion aims to provide immediate support and resources to individuals seeking mental health assistance. The system uses natural language processing to understand user inputs and provide appropriate responses and resources.

## Features

- AI-powered conversation flow
- Integration with Twilio for SMS functionality
- MySQL database for storing mental health resources
- Custom intents and sample phrases for natural language understanding

## Technical Stack

- Backend: JavaScript
- NLP Model: Twilio Autopilot
- Database: MySQL
- SMS Service: Twilio

## File Structure

- `functions/functions.js`: Contains the main backend logic and handlers for different conversation scenarios.
- `intents.json`: Defines the intents, samples, and field types for the NLP model.

## Setup

1. Set up a Twilio account and configure Autopilot.
2. Import the intents from `intents.json` into your Twilio Autopilot service.
3. Set up a MySQL database to store resources.
4. Deploy the `functions.js` file to your serverless environment (e.g., Twilio Functions).
5. Configure your Twilio number to use the deployed function.

## Usage

To interact with Comfort Companion, users can text "START" to the Twilio phone number associated with the service. The AI will then guide the conversation to understand the user's needs and provide appropriate resources.

## Demo

To see a demo of the text line in action, text START to +1 (334) 212-5686.

## Contributing

This project is no longer actively maintained due to the deprecation of Twilio Autopilot. However, the code and concept can be adapted for use with other NLP services.

## Acknowledgements

- Twilio for providing the Autopilot service (now deprecated)
