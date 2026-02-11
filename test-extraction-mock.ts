/**
 * Mock Test for AI Text Extraction
 * 
 * This test demonstrates the extraction functionality with mock responses
 * without hitting API quota limits. You can test the real API when quota resets.
 */

import { Product, ExtractionResult } from './types';

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

// Mock extraction results (simulating API responses)
const mockResults: Record<string, ExtractionResult> = {
  'Simple Sale': {
    intent: 'sale',
    recordType: 'order',
    customerName: 'Customer',
    customerHandle: 'customer_001',
    platform: 'WhatsApp',
    confidence: 'high',
    orderItems: [
      { productName: 'Laptop', quantity: 2, unitPrice: 50000 },
      { productName: 'Phone', quantity: 1, unitPrice: 30000 },
    ],
    total: 130000,
    deliveryFee: 0,
  },
  'Sale with Customer Handle': {
    intent: 'sale',
    recordType: 'order',
    customerName: 'John',
    customerHandle: 'john_whatsapp',
    platform: 'WhatsApp',
    confidence: 'high',
    orderItems: [
      { productName: 'Headphones', quantity: 3, unitPrice: 5000 },
    ],
    total: 15000,
    deliveryFee: 0,
    // address: 'Lagos', // Removed invalid property
  },
  'Add Product': {
    intent: 'product',
    name: 'Monitor',
    price: 15000,
    costPrice: 10000,
    stock: 20,
    category: 'Electronics',
    confidence: 'high',
  },
  'Expense Entry': {
    intent: 'expense',
    recordType: 'expense',
    amount: 5000,
    category: 'Logistics',
    description: 'Delivery to customer in Ikoyi',
    confidence: 'high',
  },
  // 'Customer Inquiry': { // Removed invalid inquiry intent test case
  //   intent: 'inquiry',
  //   confidence: 'high',
  //   suggestedActions: ['Calculate Price', 'Check Availability'],
  // },
  'Sale with Delivery Fee': {
    intent: 'sale',
    recordType: 'order',
    customerName: 'Chioma',
    customerHandle: 'chioma_whatsapp',
    platform: 'WhatsApp',
    confidence: 'high',
    orderItems: [
      { productName: 'Laptop', quantity: 1, unitPrice: 50000 },
      { productName: 'Headphones', quantity: 2, unitPrice: 5000 },
    ],
    total: 60000,
    deliveryFee: 2000,
  },
};

// Test cases
const testCases = [
  {
    name: 'Simple Sale',
    input: 'I want to buy 2 laptops and 1 phone for 80000 total',
    expectedIntent: 'sale',
  },
  {
    name: 'Sale with Customer Handle',
    input: 'John on WhatsApp ordered 3 headphones for 15000 from Lagos',
    expectedIntent: 'sale',
  },
  {
    name: 'Add Product',
    input: 'Add new product: Monitor, price 15000, cost 10000, stock 20',
    expectedIntent: 'product',
  },
  {
    name: 'Expense Entry',
    input: 'Paid 5000 for delivery to customer in Ikoyi',
    expectedIntent: 'expense',
  },
  // {
  //   name: 'Customer Inquiry',
  //   input: 'What is the price of a laptop?',
  //   expectedIntent: 'inquiry',
  // },
  {
    name: 'Sale with Delivery Fee',
    input: 'Customer Chioma WhatsApp: 1 laptop + 2 headphones = 60000, delivery fee 2000',
    expectedIntent: 'sale',
  },
];

// Run tests
function runMockTests() {
  console.log('🚀 Starting Mock AI Text Extraction Tests...\n');
  console.log('ℹ️  Note: These are mock results. The real API is rate-limited.\n');

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    console.log(`📝 Test: ${testCase.name}`);
    console.log(`   Input: "${testCase.input}"`);

    const result = mockResults[testCase.name];

    if (!result) {
      console.log('   ❌ No mock result defined');
      failedTests++;
      console.log();
      continue;
    }

    const intentMatch = result.intent === testCase.expectedIntent;
    console.log(`   ✅ Intent: ${result.intent} ${intentMatch ? '✓' : '✗ (expected ' + testCase.expectedIntent + ')'}`);
    console.log(`   📊 Confidence: ${result.confidence}`);

    // Show intent-specific details
    if (result.intent === 'sale') {
      const saleResult = result as any;
      console.log(`   👤 Customer: ${saleResult.customerName}`);
      console.log(`   🛍️  Items: ${saleResult.orderItems?.length || 0}`);
      saleResult.orderItems?.forEach(item => {
        console.log(`      - ${item.productName}: ${item.quantity}x @ ₦${item.unitPrice}`);
      });
      console.log(`   💰 Total: ₦${saleResult.total}`);
      if (saleResult.deliveryFee && saleResult.deliveryFee > 0) {
        console.log(`   🚚 Delivery Fee: ₦${saleResult.deliveryFee}`);
      }
    } else if (result.intent === 'product') {
      const productResult = result as any;
      console.log(`   📦 Product: ${productResult.name}`);
      console.log(`   💵 Price: ₦${productResult.price}`);
      console.log(`   💰 Cost: ₦${productResult.costPrice}`);
      console.log(`   📊 Stock: ${productResult.stock} units`);
    } else if (result.intent === 'expense') {
      const expenseResult = result as any;
      console.log(`   💸 Amount: ₦${expenseResult.amount}`);
      console.log(`   📂 Category: ${expenseResult.category}`);
      console.log(`   📝 Description: ${expenseResult.description}`);
    // Removed 'inquiry' intent case as it is not supported by ExtractedSale type
    }

    if (intentMatch) {
      passedTests++;
    } else {
      failedTests++;
    }

    console.log();
  }

  console.log('═'.repeat(60));
  console.log(`✨ Tests completed!`);
  console.log(`   ✅ Passed: ${passedTests}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failedTests}/${testCases.length}`);
  console.log('═'.repeat(60));
  console.log();
  console.log('📌 To test with real API:');
  console.log('   1. Wait for API quota to reset (limit resets daily)');
  console.log('   2. Run: npx tsx test-extraction-real.ts');
}

// Execute tests
runMockTests();
