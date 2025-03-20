
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>API Documentation - Census LMI Finder</title>
      </Helmet>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Census LMI Finder API</h1>
          <Link to="/" className="text-primary hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to App
          </Link>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="sticky top-8 space-y-2 bg-card p-4 rounded-lg shadow">
              <h3 className="font-medium mb-3">Contents</h3>
              <ul className="space-y-2">
                <li><a href="#introduction" className="text-primary hover:underline block">Introduction</a></li>
                <li><a href="#authentication" className="text-primary hover:underline block">Authentication</a></li>
                <li><a href="#rate-limits" className="text-primary hover:underline block">Rate Limits</a></li>
                <li><a href="#endpoints" className="text-primary hover:underline block">Endpoints</a></li>
                <li><a href="#check-lmi" className="text-primary hover:underline block pl-4">Check LMI Status</a></li>
                <li><a href="#errors" className="text-primary hover:underline block">Error Handling</a></li>
                <li><a href="#examples" className="text-primary hover:underline block">Code Examples</a></li>
              </ul>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3 space-y-10">
            <section id="introduction" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="mb-4">
                The Census LMI Finder API provides endpoints to determine if an address is located in a 
                Low-to-Moderate Income (LMI) census tract. This documentation covers the available endpoints, 
                request formats, response structures, and error handling.
              </p>
              <p className="mb-4">
                The API uses U.S. Census Bureau data to identify census tracts and determine income 
                classifications based on the American Community Survey (ACS) 5-Year Estimates. An address 
                is considered LMI-eligible if it is in a census tract with a median household income that 
                is 80% or less than the Area Median Income (AMI).
              </p>
              
              <div className="bg-muted/50 border-l-4 border-primary p-4 mt-6">
                <h4 className="font-semibold">Census API Attribution</h4>
                <p className="text-sm text-muted-foreground">
                  This service uses data from the U.S. Census Bureau's APIs. Per Census Bureau guidelines, 
                  all implementations must include proper attribution.
                </p>
                <p className="text-sm mt-2">
                  Source: U.S. Census Bureau American Community Survey 5-Year Estimates
                </p>
              </div>
            </section>

            <section id="authentication" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Authentication</h2>
              <p>
                The API currently does not require authentication for public endpoints. 
                However, rate limits apply to prevent abuse.
              </p>
            </section>

            <section id="rate-limits" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
              <div className="bg-muted/50 p-4 rounded-md mb-4">
                <p className="font-medium">Current limits: 100 requests per hour per IP address</p>
              </div>
              <p>
                When a rate limit is exceeded, the API will return a 429 Too Many Requests response 
                with information about when you can resume making requests.
              </p>
              
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-6 dark:bg-amber-900/20 dark:border-amber-700">
                <h4 className="font-semibold">Census API Limitations</h4>
                <p className="mb-2">Our service uses the Census Bureau's API, which has the following limitations:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Daily query limit: 500 queries per API key</li>
                  <li>The Census API may experience occasional downtime for maintenance</li>
                  <li>Data is based on the latest available American Community Survey 5-Year Estimates</li>
                  <li>Response caching is enabled to minimize API calls and stay within rate limits</li>
                </ul>
              </div>
            </section>

            <section id="endpoints" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
              <p>The base URL for all API endpoints is the current domain where this documentation is hosted.</p>
            </section>

            <section id="check-lmi" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Check LMI Status</h2>
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">POST</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">/api/check_lmi</code>
              </div>
              
              <p className="mb-6">
                Checks if an address is in a Low-to-Moderate Income (LMI) census tract and returns 
                detailed income information.
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Request Body</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Parameter</th>
                        <th className="border p-2 text-left">Type</th>
                        <th className="border p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">address</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">The address to check (e.g., "123 Main St, Anytown, CA 12345")</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h4 className="text-md font-medium mt-4 mb-2">Example Request:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{`{
  "address": "123 Main St, San Francisco, CA 94105"
}`}</code>
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Response</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border p-2 text-left">Field</th>
                        <th className="border p-2 text-left">Type</th>
                        <th className="border p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">status</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">"success" or "error"</td>
                      </tr>
                      <tr>
                        <td className="border p-2">address</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">The validated address</td>
                      </tr>
                      <tr>
                        <td className="border p-2">lat</td>
                        <td className="border p-2">number</td>
                        <td className="border p-2">Latitude</td>
                      </tr>
                      <tr>
                        <td className="border p-2">lon</td>
                        <td className="border p-2">number</td>
                        <td className="border p-2">Longitude</td>
                      </tr>
                      <tr>
                        <td className="border p-2">tract_id</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">Census tract ID</td>
                      </tr>
                      <tr>
                        <td className="border p-2">median_income</td>
                        <td className="border p-2">number</td>
                        <td className="border p-2">Median household income for the tract</td>
                      </tr>
                      <tr>
                        <td className="border p-2">ami</td>
                        <td className="border p-2">number</td>
                        <td className="border p-2">Area Median Income (AMI) for the region</td>
                      </tr>
                      <tr>
                        <td className="border p-2">percentage_of_ami</td>
                        <td className="border p-2">number</td>
                        <td className="border p-2">Tract median income as a percentage of AMI</td>
                      </tr>
                      <tr>
                        <td className="border p-2">eligibility</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">"Eligible" or "Ineligible"</td>
                      </tr>
                      <tr>
                        <td className="border p-2">is_approved</td>
                        <td className="border p-2">boolean</td>
                        <td className="border p-2">Whether the location is approved for LMI</td>
                      </tr>
                      <tr>
                        <td className="border p-2">data_source</td>
                        <td className="border p-2">string</td>
                        <td className="border p-2">Source of the census data</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h4 className="text-md font-medium mt-4 mb-2">Example Success Response:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{`{
  "status": "success",
  "address": "123 MAIN ST, SAN FRANCISCO, CA 94105",
  "lat": 37.7749,
  "lon": -122.4194,
  "tract_id": "06075010800",
  "median_income": 62500,
  "ami": 100000,
  "income_category": "Moderate Income",
  "percentage_of_ami": 62.5,
  "eligibility": "Eligible",
  "color_code": "success",
  "is_approved": true,
  "approval_message": "APPROVED - This location is in a Moderate Income Census Tract",
  "lmi_status": "LMI Eligible",
  "timestamp": "2023-05-01T12:34:56.789Z",
  "data_source": "U.S. Census Bureau American Community Survey 5-Year Estimates"
}`}</code>
                </pre>
                
                <h4 className="text-md font-medium mt-4 mb-2">Example Error Response:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>{`{
  "status": "error",
  "message": "Unable to determine census tract for address",
  "timestamp": "2023-05-01T12:34:56.789Z"
}`}</code>
                </pre>
              </div>
            </section>

            <section id="errors" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
              <p className="mb-4">
                The API uses standard HTTP status codes to indicate the success or failure of requests.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Status Code</th>
                      <th className="border p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">200 OK</td>
                      <td className="border p-2">The request was successful</td>
                    </tr>
                    <tr>
                      <td className="border p-2">400 Bad Request</td>
                      <td className="border p-2">The request was invalid or missing required parameters</td>
                    </tr>
                    <tr>
                      <td className="border p-2">429 Too Many Requests</td>
                      <td className="border p-2">Rate limit exceeded</td>
                    </tr>
                    <tr>
                      <td className="border p-2">500 Internal Server Error</td>
                      <td className="border p-2">An error occurred on the server</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="examples" className="p-6 bg-card rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
              
              <h3 className="text-lg font-medium mb-2">JavaScript</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto mb-6">
                <code>{`// Using fetch
async function checkLmiStatus(address) {
  try {
    const response = await fetch('/api/check_lmi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });
    
    if (!response.ok) {
      throw new Error(\`Error: \${response.status}\`);
    }
    
    const data = await response.json();
    console.log('LMI Status:', data);
    return data;
  } catch (error) {
    console.error('Error checking LMI status:', error);
    throw error;
  }
}`}</code>
              </pre>
              
              <h3 className="text-lg font-medium mb-2">Python</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                <code>{`# Using requests
import requests
import json

def check_lmi_status(address):
    url = "https://yourdomain.com/api/check_lmi"
    payload = {"address": address}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        response.raise_for_status()  # Raise an exception for 4XX/5XX responses
        
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error checking LMI status: {e}")
        return None`}</code>
              </pre>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;
