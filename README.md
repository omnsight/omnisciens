# Omnisciens

Omnisciens is an intelligent OSINT (Open Source Intelligence) platform that provides powerful data mining, analytics, and visualization capabilities.

## Project Structure

The folder `src` contains all the source code including both frontend, backend, and data models.

```bash
src/
    crawler/
        # Crawler documentation
        README.md
    frontend/
        common/
            # Common frontend code
        geovision/
            # Frontend code for geovision
            ...
        # the rest of the frontend setup
        ...
        # Frontend documentation
        README.md
    geovision/
        # backend code
        ...
        # geovision service documentation
        README.md
    idl/
        geovision/
            # service interfaces
            ...
        model/
            # common data models
            ...
        # IDL documentation
        README.md
```

## Infrastructure Setup

The project heavily rely on ArangoDB for OSINT data storage and analysis. Frontend is built with React, and backend uses GoLang and Python. gRPC is used to model both the data and each individual micro-service. GeoVision backend is built with Gin. Crawler is based on Scrapy.

## Documentation Guidelines

Each readme file should cover ONLY these aspects:
- Project overview stating what the project is about
- Folder structure that covers what each main folder/file does
- Infrastructure overview that covers high-level design
- How to run locally

Each document should NOT cover any design/implementation details. The code should be self-explanatory.
