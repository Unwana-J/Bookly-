import * as fs from 'fs';
import * as path from 'path';

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

import { analyzeIntentAndExtract } from './services/geminiService';
import { Product } from './types';

// Sample inventory for testing
const sampleInventory: Product[] = [
  {
    id: '1',
    name: 'Laptop',
    price: 50000,
    costPrice: 35000,
    stock: 10,
    totalSales: 5,
    category: 'Electronics',
    description: 'Dell XPS 13',
  },
  {
    id: '2',
    name: 'Phone',
    price: 30000,
    costPrice: 20000,
    stock: 15,
    totalSales: 20,
    category: 'Electronics',
    description: 'iPhone 14',
  },
  {
    id: '3',
    name: 'Headphones',
    price: 5000,
    costPrice: 2500,
    stock: 50,
    totalSales: 100,
    category: 'Accessories',
    description: 'Sony WH-1000XM5',
  },
  {
    id: '4',
    name: 'USB Cable',
    price: 1500,
    costPrice: 500,
    stock: 200,
    totalSales: 500,
    category: 'Accessories',
  },
];

// Test cases
const testCases = [
  // Test 1: Simple sale
  {
    name: 'Simple Sale',
    input: 'I want to buy 2 laptops and 1 phone for 80000 total',
    expectedIntent: 'sale',
  },
  // Test 2: Sale with customer handle
  {
    name: 'Sale with Customer Handle',
    input: 'John on WhatsApp ordered 3 headphones for 15000 from Lagos',
    expectedIntent: 'sale',
  },
  // Test 3: Product addition
  {
    name: 'Add Product',
    input: 'Add new product: Monitor, price 15000, cost 10000, stock 20',
    expectedIntent: 'product',
  },
  // Test 4: Expense
  {
    name: 'Expense Entry',
    input: 'Paid 5000 for delivery to customer in Ikoyi',
    expectedIntent: 'expense',
  },
  // Test 5: Inquiry
  {
    name: 'Customer Inquiry',
    input: 'What is the price of a laptop?',
    expectedIntent: 'inquiry',
  },
  // Test 6: Complex sale with delivery fee
  {
    name: 'Sale with Delivery Fee',
    input: 'Customer Chioma WhatsApp: 1 laptop + 2 headphones = 60000, delivery fee 2000',
    expectedIntent: 'sale',
  },
];

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Text Extraction Tests...\n');

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Input: "${testCase.input}"`);

    try {
      const result = await analyzeIntentAndExtract(
        [{ text: testCase.input }],
        sampleInventory
      );

      if (!result) {
        console.log('   ❌ Result: null/undefined');
        console.log();
        continue;
      }

      console.log(`   ✅ Intent: ${result.intent}`);
      console.log(`   📊 Confidence: ${result.confidence}`);

      // Show intent-specific details
      if (result.intent === 'sale') {
        console.log(`   👤 Customer: ${result.customerName}`);
        console.log(`   🛍️  Items: ${result.orderItems?.length || 0}`);
        console.log(`   💰 Total: ${result.total}`);
        if (result.deliveryFee) {
          console.log(`   🚚 Delivery Fee: ${result.deliveryFee}`);
        }
      } else if (result.intent === 'product') {
        console.log(`   📦 Product: ${result.name}`);
        console.log(`   💵 Price: ${result.price}`);
        console.log(`   📊 Stock: ${result.stock}`);
      } else if (result.intent === 'expense') {
        console.log(`   💸 Amount: ${result.amount}`);
        console.log(`   📂 Category: ${result.category}`);
      // Removed 'inquiry' intent case as it is not supported by ExtractedSale type
      }

      console.log();
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.log();
    }
  }

  console.log('✨ Tests completed!');
}

// Execute tests
runTests().catch(console.error);
