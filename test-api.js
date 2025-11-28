const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

const API_KEY = decodeURIComponent('80xUsCgepF86Z2w4g%2BHDkjQc34EdeaXB7OHRMx%2FEoJF2293eGv6QlPjt9dZRPb4g440XcX1%2B1jCvMwcLxgjZ6A%3D%3D');

async function testApi() {
    try {
        // User's reported coordinates
        const lat = 37.5205802;
        const lon = 126.8318976;

        const url = 'http://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytLcinfoInqire';
        const queryParams = `?serviceKey=${encodeURIComponent(API_KEY)}&WGS84_LON=${lon}&WGS84_LAT=${lat}&pageNo=1&numOfRows=50`;

        console.log('Testing API URL:', url + queryParams);

        const response = await axios.get(url + queryParams);
        console.log('Response Status:', response.status);

        let dataToParse = response.data;
        if (typeof response.data === 'object') {
            console.log('Response Data is Object:', JSON.stringify(response.data).substring(0, 500));
            dataToParse = response.data; // It's already an object/JSON
        } else {
            console.log('Response Data (Raw):', response.data.substring(0, 500) + '...');
            dataToParse = response.data;
        }

        const parser = new XMLParser();
        // If it's already an object, parser might throw or behave unexpectedly if we don't handle it
        // But usually data.go.kr returns XML unless JSON is requested. Axios might auto-parse JSON if header says so.
        // If it is XML string:
        let result;
        if (typeof dataToParse === 'string') {
            result = parser.parse(dataToParse);
        } else {
            result = dataToParse;
        }

        console.log('Parsed Result:', JSON.stringify(result, null, 2));

        if (result.response && result.response.header && result.response.header.resultCode === '00') {
            console.log('SUCCESS: API call successful.');
            if (result.response.body.items) {
                console.log(`Found ${result.response.body.totalCount} items.`);
            } else {
                console.log('No items found in this location.');
            }
        } else {
            console.log('FAILURE: API returned error or invalid format.');
        }

    } catch (error) {
        console.error('Error testing API:', error.message);
        if (error.response) {
            console.error('Error Data:', error.response.data);
        }
    }
}

testApi();
