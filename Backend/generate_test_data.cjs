const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: 'Test Vendor',
        phone: '1234567890',
        email: 'vendor@test.com',
        password: 'password123',
        actual_password: 'password123',
        role: 'VENDOR'
      }
    });
  }

  const categoryName = 'Test Category ' + Date.now();
  const category = await prisma.productCategory.create({
    data: {
      productCategoryName: categoryName,
      userId: user.id
    }
  });

  console.log('Created category:', category.id);

  const subCategories = [];
  for (let i = 1; i <= 8; i++) {
    const subCat = await prisma.productSubCategory.create({
      data: {
        productSubCategoryName: `Test SubCategory ${i}`,
        categoryId: category.id,
        userId: user.id
      }
    });
    subCategories.push(subCat);
  }
  
  console.log('Created subcategories');

  let productCount = 0;
  for (let i = 0; i < 15; i++) {
    const subCat = subCategories[i % subCategories.length];
    
    const product = await prisma.product.create({
      data: {
        productName: `Test Product ${i + 1}`,
        description: `Description for test product ${i + 1}`,
        categoryId: category.id,
        subCategoryId: subCat.id,
        userId: user.id,
        isApprove: true,
        variants: {
            create: {
                actualPrice: 100,
                mrp: 120,
                vendorMinPrice: 90,
                stock: 50,
                isDefault: true
            }
        }
      }
    });
    productCount++;
  }
  
  console.log(`Created ${productCount} products in category ${category.id}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
