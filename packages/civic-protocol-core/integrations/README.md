# Integration Components

This directory contains integration components and tools for connecting various parts of the Civic Protocol Core ecosystem.

## Lab6 Citizen Shield Integration

Integration tools and API routes for connecting Lab6 Citizen Shield with the broader Civic Protocol ecosystem.

### Components

- **API Routes**: Onboarding and integration endpoints
- **Postman Collection**: API testing and documentation
- **Deployment Config**: Render.com deployment configuration
- **Documentation**: Integration guides and updates

### Features

- **Onboarding Integration**: Seamless citizen onboarding workflows
- **API Testing**: Comprehensive Postman collection for testing
- **Deployment Ready**: Pre-configured for Render.com deployment
- **Documentation**: Detailed integration guides and updates

### Getting Started

```bash
cd integrations/lab6-citizen-shield
# Follow README_UPDATE.md for detailed setup instructions
```

### Project Structure

```
lab6-citizen-shield/
├── app_routes_onboard.py              # Onboarding API routes
├── Lab6-CitizenShield.postman_collection.json  # API testing collection
├── README_UPDATE.md                   # Integration documentation
└── render.yaml                        # Deployment configuration
```

### API Testing

Use the provided Postman collection to test the integration:

1. Import `Lab6-CitizenShield.postman_collection.json` into Postman
2. Configure environment variables
3. Run the collection tests
4. Verify integration endpoints

### Deployment

The integration is configured for deployment on Render.com:

```yaml
# render.yaml configuration
services:
  - type: web
    name: lab6-citizen-shield
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app_routes_onboard.py
```

### Integration Points

The Lab6 Citizen Shield integration connects with:

- **Civic Ledger API**: Event anchoring and verification
- **Lab4 Reflections API**: Citizen reflection management
- **GIC Indexer**: Balance and reward computation
- **Frontend Applications**: User interface integration

### Development

1. **Setup Environment**: Follow the setup instructions in `README_UPDATE.md`
2. **Test Integration**: Use the Postman collection for testing
3. **Deploy Changes**: Update the Render.com configuration as needed
4. **Monitor Integration**: Check logs and metrics for integration health

### Troubleshooting

Common integration issues:

- **API Endpoint Errors**: Verify endpoint URLs and authentication
- **Deployment Issues**: Check Render.com logs and configuration
- **Testing Failures**: Review Postman collection and environment variables
- **Integration Errors**: Check service connectivity and API responses

### Contributing

1. Follow the existing code patterns and documentation
2. Update the Postman collection when adding new endpoints
3. Test all changes thoroughly before deployment
4. Update documentation for any new integration features
