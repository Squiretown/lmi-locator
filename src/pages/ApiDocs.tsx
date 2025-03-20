
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ApiDocs: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-slate-50 py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="hidden md:block">
              <div className="sticky top-20 bg-white rounded-lg shadow-sm p-4">
                <nav className="space-y-1">
                  <a href="#introduction" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Introduction</a>
                  <a href="#authentication" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Authentication</a>
                  <a href="#rate-limits" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Rate Limits</a>
                  <a href="#endpoints" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Endpoints</a>
                  <a href="#verify-address" className="block px-3 py-2 text-sm rounded-md pl-6 hover:bg-primary/10 hover:text-primary">Verify Address</a>
                  <a href="#check-lmi" className="block px-3 py-2 text-sm rounded-md pl-6 hover:bg-primary/10 hover:text-primary">Check LMI Status</a>
                  <a href="#errors" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Error Handling</a>
                  <a href="#examples" className="block px-3 py-2 text-sm rounded-md hover:bg-primary/10 hover:text-primary">Code Examples</a>
                  
                  <div className="pt-4 mt-4 border-t">
                    <Link to="/" className="flex items-center text-sm text-primary">
                      <span className="ml-1">← Back to App</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
            
            {/* Documentation Content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                  <h1 className="text-2xl font-bold">Census LMI Finder API</h1>
                  <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-md">v1.0</span>
                </div>
                
                {/* Mobile Navigation */}
                <div className="md:hidden mb-6">
                  <details className="border rounded-md">
                    <summary className="px-4 py-2 cursor-pointer font-medium">Jump to Section</summary>
                    <div className="p-2 space-y-1 text-sm">
                      <a href="#introduction" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Introduction</a>
                      <a href="#authentication" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Authentication</a>
                      <a href="#rate-limits" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Rate Limits</a>
                      <a href="#endpoints" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Endpoints</a>
                      <a href="#verify-address" className="block px-3 py-2 pl-6 hover:bg-slate-100 rounded-md">Verify Address</a>
                      <a href="#check-lmi" className="block px-3 py-2 pl-6 hover:bg-slate-100 rounded-md">Check LMI Status</a>
                      <a href="#errors" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Error Handling</a>
                      <a href="#examples" className="block px-3 py-2 hover:bg-slate-100 rounded-md">Code Examples</a>
                    </div>
                  </details>
                  <div className="mt-3">
                    <Link to="/" className="block w-full py-2 text-center text-sm border border-primary text-primary rounded-md">
                      ← Back to App
                    </Link>
                  </div>
                </div>

                {/* Introduction Section */}
                <section id="introduction" className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                  <p className="text-slate-700 mb-3">
                    The Census LMI Finder API provides endpoints to geocode US addresses and determine if they are located in Low-to-Moderate Income (LMI) census tracts. This documentation covers the available endpoints, request formats, response structures, and error handling.
                  </p>
                  <p className="text-slate-700 mb-4">
                    The API uses Census Bureau data to identify census tracts and determine income classifications based on the American Community Survey (ACS) 5-Year Estimates. An address is considered LMI-eligible if it is in a census tract with a median household income that is 80% or less than the Area Median Income (AMI).
                  </p>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                    <h5 className="font-semibold text-blue-700 flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Census API Attribution
                    </h5>
                    <p className="text-blue-700 text-sm">
                      This service uses data from the U.S. Census Bureau's APIs. Per Census Bureau guidelines, all implementations must include proper attribution.
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      Source: <a href="https://www.census.gov/data/developers.html" target="_blank" rel="noreferrer" className="underline">U.S. Census Bureau</a> American Community Survey 5-Year Estimates
                    </p>
                  </div>
                </section>

                {/* Authentication Section */}
                <section id="authentication" className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">Authentication</h2>
                  <p className="text-slate-700 mb-3">
                    The API currently does not require authentication for public endpoints. However, rate limits apply to prevent abuse.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
                    <p className="text-blue-700 text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      For production environments or increased rate limits, please contact the administrator.
                    </p>
                  </div>
                </section>

                {/* Rate Limits Section */}
                <section id="rate-limits" className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">Rate Limits</h2>
                  <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-md mb-3">
                    <p className="text-slate-700 font-medium">Current limits: 100 requests per hour per IP address</p>
                  </div>
                  <p className="text-slate-700">
                    When a rate limit is exceeded, the API will return a 429 Too Many Requests response with information about when you can resume making requests.
                  </p>
                </section>

                {/* Endpoints Section */}
                <section id="endpoints" className="mb-10">
                  <h2 className="text-xl font-semibold mb-3">Endpoints</h2>
                  <p className="text-slate-700 mb-6">
                    The base URL for all API endpoints is the current domain where this documentation is hosted.
                  </p>

                  {/* Census Limitations */}
                  <div id="census-limitations" className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Census API Usage Notes</h3>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                      <h5 className="font-semibold text-amber-700 flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        API Limitations
                      </h5>
                      <p className="text-amber-700 text-sm mb-2">
                        Our service uses the Census Bureau's API, which has the following limitations:
                      </p>
                      <ul className="text-amber-700 text-sm list-disc list-inside">
                        <li>Daily query limit: 500 queries per API key</li>
                        <li>The Census API may experience occasional downtime for maintenance</li>
                        <li>Data is based on the latest available American Community Survey 5-Year Estimates</li>
                        <li>Response caching is enabled to minimize API calls and stay within rate limits</li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Check LMI Status Endpoint */}
                  <div id="check-lmi" className="mb-8 border-b pb-8">
                    <h3 className="text-lg font-semibold mb-3">Check LMI Status</h3>
                    <div className="flex items-center mb-3">
                      <span className="bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded mr-2">POST</span>
                      <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">/api/check_lmi</code>
                    </div>
                    <p className="text-slate-700 mb-4">
                      Checks if an address is in a Low-to-Moderate Income (LMI) census tract and returns detailed income information.
                    </p>
                    
                    {/* Request Body */}
                    <div className="mb-4">
                      <h5 className="font-semibold mb-2">Request Body</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-200 mb-3">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Parameter</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Type</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b font-medium">address</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">The address to check (e.g., "123 Main St, Anytown, CA 12345")</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <h6 className="font-medium text-sm mb-2">Example Request:</h6>
                      <pre className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto text-sm">
                        {`{
  "address": "123 Main St, San Francisco, CA 94105"
}`}
                      </pre>
                    </div>
                    
                    {/* Response */}
                    <div>
                      <h5 className="font-semibold mb-2">Response</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-slate-200 mb-3">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Field</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Type</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">status</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">"success" or "error"</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">address</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">The validated address</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">lat</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">number</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Latitude</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">lon</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">number</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Longitude</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">tract_id</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Census tract ID</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">median_income</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">number</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Median household income for the tract</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">ami</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">number</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Area Median Income (AMI) for the region</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">income_category</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Income classification (Low, Moderate, Middle, or Upper)</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">percentage_of_ami</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">number</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Tract median income as a percentage of AMI</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">eligibility</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">"Eligible" or "Ineligible"</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">is_approved</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">boolean</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Whether the location is LMI-approved</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">approval_message</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">string</td>
                              <td className="px-4 py-2 text-sm text-slate-700 border-b">Human-readable approval message</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <h6 className="font-medium text-sm mb-2">Example Success Response:</h6>
                      <pre className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto text-sm">
                        {`{
  "status": "success",
  "address": "123 MAIN ST, SAN FRANCISCO, CA 94105",
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
}`}
                      </pre>
                      
                      <h6 className="font-medium text-sm mt-4 mb-2">Example Error Response:</h6>
                      <pre className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto text-sm">
                        {`{
  "status": "error",
  "message": "Invalid address format. Please provide a complete address.",
  "error_code": "INVALID_ADDRESS"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Error Handling Section */}
                  <section id="errors" className="mb-10">
                    <h2 className="text-xl font-semibold mb-3">Error Handling</h2>
                    <p className="text-slate-700 mb-4">
                      When an error occurs, the API will return a JSON response with a status code, error message, and an error code that can be used to identify the specific error.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-slate-200 mb-3">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Status Code</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Error Code</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-slate-700 border-b">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">400</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">INVALID_REQUEST</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">The request is malformed or missing required fields</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">400</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">INVALID_ADDRESS</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">The provided address is invalid or could not be geocoded</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">404</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">TRACT_NOT_FOUND</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">No census tract could be found for the coordinates</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">429</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">RATE_LIMIT_EXCEEDED</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">You have exceeded the rate limit</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">500</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">INTERNAL_ERROR</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">An unexpected error occurred on the server</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">503</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">CENSUS_API_ERROR</td>
                            <td className="px-4 py-2 text-sm text-slate-700 border-b">The Census API is unavailable or returned an error</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Code Examples Section */}
                  <section id="examples" className="mb-6">
                    <h2 className="text-xl font-semibold mb-3">Code Examples</h2>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">JavaScript (Fetch API)</h4>
                      <pre className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto text-sm">
                        {`async function checkLmiStatus(address) {
  try {
    const response = await fetch('/api/check_lmi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking LMI status:', error);
    throw error;
  }
}

// Example usage
checkLmiStatus('123 Main St, San Francisco, CA 94105')
  .then(result => {
    console.log('LMI Status:', result.eligibility);
    console.log('Is Approved:', result.is_approved);
  })
  .catch(error => {
    console.error('Error:', error);
  });`}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Python (Requests)</h4>
                      <pre className="bg-slate-800 text-slate-100 p-3 rounded-md overflow-x-auto text-sm">
                        {`import requests
import json

def check_lmi_status(address):
    try:
        response = requests.post(
            'https://your-domain.com/api/check_lmi',
            json={'address': address},
            headers={'Content-Type': 'application/json'}
        )
        
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    
    except requests.exceptions.RequestException as e:
        print(f"Error checking LMI status: {e}")
        raise

# Example usage
try:
    result = check_lmi_status('123 Main St, San Francisco, CA 94105')
    print(f"LMI Status: {result['eligibility']}")
    print(f"Is Approved: {result['is_approved']}")
except Exception as e:
    print(f"Error: {e}")`}
                      </pre>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApiDocs;
