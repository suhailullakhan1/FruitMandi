
import { db } from './db';
import { users, merchants, fruits } from '@shared/schema';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create default admin user
    const [adminUser] = await db.insert(users).values({
      phone: '+1234567890',
      role: 'company',
      name: 'Admin User',
      isActive: true
    }).returning();

    console.log('Created admin user:', adminUser);

    // Create sample fruits
    const sampleFruits = [
      { name: 'Mango', variety: 'Large', currentRate: '50.00', unit: 'kg' },
      { name: 'Mango', variety: 'Medium', currentRate: '45.00', unit: 'kg' },
      { name: 'Mango', variety: 'Small', currentRate: '40.00', unit: 'kg' },
      { name: 'Apple', variety: 'Red', currentRate: '80.00', unit: 'kg' },
      { name: 'Orange', variety: 'Sweet', currentRate: '60.00', unit: 'kg' }
    ];

    const createdFruits = await db.insert(fruits).values(sampleFruits).returning();
    console.log('Created fruits:', createdFruits);

    // Create sample merchant
    const [merchant] = await db.insert(merchants).values({
      userId: adminUser.id,
      merchantCode: 'MERCH001',
      name: 'Sample Merchant',
      phone: '+1234567891',
      address: '123 Market Street',
      commissionRate: '5.00',
      isActive: true
    }).returning();

    console.log('Created merchant:', merchant);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
