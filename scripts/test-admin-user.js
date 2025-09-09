#!/usr/bin/env node

/**
 * Test script to create a test admin user and verify admin functionality
 * Run this script to test the admin role functionality
 */

const testUser = {
    id: 1,
    firstName: "Admin",
    lastName: "User",
    email: "admin@hotimpex.com",
    role: "admin",
    createdAt: new Date().toISOString()
};

console.log('=== ADMIN USER TEST ===');
console.log('Test user data:', JSON.stringify(testUser, null, 2));

// Simulate storing the user in localStorage (this would normally be done by the authentication system)
console.log('\nTo test the admin functionality:');
console.log('1. Open your browser console on any page of the website');
console.log('2. Run this command to simulate an admin login:');
console.log(`   localStorage.setItem('hotimpex-user', '${JSON.stringify(testUser)}');`);
console.log(`   localStorage.setItem('hotimpex-token', 'test-admin-token-123');`);
console.log('3. Refresh the page');
console.log('4. Click on the Account dropdown in the header');
console.log('5. You should now see the "Admin Panel" link in blue');
console.log('6. Click the Admin Panel link to navigate to the admin page');

console.log('\nTo test with a regular user (no admin access):');
const regularUser = { ...testUser, role: "customer" };
console.log(`   localStorage.setItem('hotimpex-user', '${JSON.stringify(regularUser)}');`);
console.log('   Refresh and the Admin Panel link should be hidden');

console.log('\n=== TEST COMPLETED ===');
