
async function testApi() {
    try {
        const response = await fetch('http://localhost:8000/api/docentes?page=1&per_page=10');
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response keys:', Object.keys(data));
        if (data.data && Array.isArray(data.data)) {
            console.log('Data count:', data.data.length);
            console.log('Pagination info:', {
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
                per_page: data.per_page
            });
        } else {
            console.log('Data is NOT paginated array. Type:', typeof data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
