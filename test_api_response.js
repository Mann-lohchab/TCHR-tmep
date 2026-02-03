// Test script to verify the API response display functionality
const testData = {
  "message": "Hello! How can I assist you today?",
  "status": "success",
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true
    },
    "lessons": [
      {
        "id": 1,
        "title": "Introduction to Mathematics",
        "duration": 60,
        "completed": false
      },
      {
        "id": 2,
        "title": "Advanced Algebra",
        "duration": 90,
        "completed": true
      }
    ],
    "stats": {
      "totalLessons": 10,
      "completedLessons": 4,
      "averageScore": 85.5
    }
  },
  "timestamp": "2025-12-27T16:55:00Z"
};

console.log("Testing API response display with sample data:");
console.log(JSON.stringify(testData, null, 2));

// Simulate the renderApiResponse function logic
function testRenderApiResponse(data, depth = 0) {
  if (depth > 5) {
    console.log("  ".repeat(depth * 2) + "[Nested data]");
    return;
  }

  Object.entries(data).forEach(([key, value]) => {
    const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
    const isArray = Array.isArray(value);

    console.log("  ".repeat(depth * 2) + `${key}:`);

    if (isObject) {
      console.log("  ".repeat(depth * 2) + "{");
      testRenderApiResponse(value, depth + 1);
      console.log("  ".repeat(depth * 2) + "}");
    } else if (isArray) {
      console.log("  ".repeat(depth * 2) + "[");
      if (value.length > 0) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            testRenderApiResponse(item, depth + 1);
          } else {
            console.log("  ".repeat((depth + 1) * 2) + JSON.stringify(item));
          }
        });
      } else {
        console.log("  ".repeat((depth + 1) * 2) + "Empty array");
      }
      console.log("  ".repeat(depth * 2) + "]");
    } else {
      const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
      console.log("  ".repeat((depth + 1) * 2) + valueStr);
    }
  });
}

console.log("\nStructured output:");
testRenderApiResponse(testData);

console.log("\n✅ API response display test completed successfully!");