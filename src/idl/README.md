# Omnidl

Omnidl hosts the data models and service definitions for all Omnisciens services, defining the contracts between services and the data models for backend services and ArangoDB.

## Directory Structure

```
geovision/
├── *.proto              # GeoVision service definitions
model/
├── data_models.proto    # Shared data models across services
```

## Local Development

```bash
# Generate Go bindings for GeoVision services
make gen_geovision
make gen_geovision_openapi
```

## Documentation Guidelines

Each readme file should cover ONLY these aspects:
- Project overview stating what the project is about
- Folder structure that covers what each main folder/file does
- Infrastructure overview that covers high-level design
- How to run locally

Each document should NOT cover any design/implementation details. The code should be self-explanatory.
