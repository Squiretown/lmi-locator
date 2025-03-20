
# Census LMI Finder

A web application and API that uses U.S. Census Bureau data to determine if an address is in a Low-to-Moderate Income (LMI) eligible census tract.

## Features

- Address geocoding using Census and ESRI APIs
- Census tract identification
- Median household income determination via Census ACS 5-Year Estimates
- LMI eligibility calculation based on Area Median Income (AMI)
- Interactive map display of results
- RESTful API for integration with other systems

## Setup and Installation

### Prerequisites

- Node.js & npm
- Supabase account (for backend services)
- Census API key (register at [api.census.gov](https://api.census.gov/data/key_signup.html))

### Environment Variables

Set the following environment variables in your Supabase project:

```
CENSUS_API_KEY=your_census_api_key
ESRI_API_KEY=your_esri_api_key (optional, for backup geocoding)
HUD_AMI=area_median_income_value
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## API Usage

### Check LMI Status

**Endpoint:** `POST /api/check_lmi`

**Request Format:**
```json
{
  "address": "123 Main St, Anytown, ST 12345"
}
```

**Response Format:**
```json
{
  "status": "success",
  "address": "123 MAIN ST, ANYTOWN, ST 12345",
  "lat": 37.7749,
  "lon": -122.4194,
  "tract_id": "06075010800",
  "median_income": 75000,
  "ami": 100000,
  "income_category": "Moderate Income",
  "percentage_of_ami": 75.0,
  "eligibility": "Eligible",
  "color_code": "success",
  "is_approved": true,
  "approval_message": "APPROVED - This location is in a Moderate Income Census Tract",
  "lmi_status": "Yes",
  "timestamp": "2025-03-19T10:30:45.123456",
  "data_source": "U.S. Census Bureau American Community Survey"
}
```

## Technology Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (backend)

## Census API Attribution

This application uses data from the U.S. Census Bureau's APIs. Per Census Bureau guidelines, all implementations must include proper attribution.

**Source:** U.S. Census Bureau American Community Survey 5-Year Estimates

## Census API Limitations

- Daily query limit: 500 queries per API key
- Response caching is enabled to minimize API calls and stay within rate limits

## License

[MIT License](LICENSE)

## How to Deploy

To deploy this project, visit [Lovable](https://lovable.dev/projects/358d21c3-f455-4e18-831b-51824c4e2cd4) and click on Share -> Publish.

