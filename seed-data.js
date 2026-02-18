import pool from './config/database.js';

async function seedImages() {
  try {
    // Get all properties
    const propertiesRes = await pool.query('SELECT id FROM properties ORDER BY id');
    const propertyIds = propertiesRes.rows.map(row => row.id);
    
    if (propertyIds.length === 0) {
      console.log('No properties found to seed images for');
      process.exit(0);
    }
    
    const imageUrls = [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
      'https://images.unsplash.com/photo-1516594915697-87eb3b1a3069?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&q=80',
      'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-495f67f88bda?w=800&q=80',
      'https://images.unsplash.com/photo-1500595046891-0573fbe7e6b7?w=800&q=80',
      'https://images.unsplash.com/photo-1500382017468-7049fdf98338?w=800&q=80',
      'https://images.unsplash.com/photo-1513984977263-4ca427ba0f9b?w=800&q=80',
      'https://images.unsplash.com/photo-1495615811223-4d98c6e9c869?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
    ];
    
    console.log(`Seeding images for ${propertyIds.length} properties`);
    
    let imageCount = 0;
    for (const propertyId of propertyIds) {
      // Add 3 images per property
      for (let i = 0; i < 3; i++) {
        const imageUrl = imageUrls[(imageCount + i) % imageUrls.length];
        await pool.query(
          'INSERT INTO property_images (property_id, image_url, image_order) VALUES ($1, $2, $3)',
          [propertyId, imageUrl, i]
        );
      }
      imageCount += 3;
    }
    
    console.log('✅ Images seeded successfully!');
    const imagesRes = await pool.query('SELECT COUNT(*) FROM property_images');
    console.log('Total images in DB:', imagesRes.rows[0].count);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding images:', error.message);
    process.exit(1);
  }
}

seedImages();
