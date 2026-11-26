#!/bin/bash
# ==============================================================================
# Auto Database Sync & Server Restart Script for cPanel (MilesWeb)
# ==============================================================================
# Ye script automatically:
# 1. cPanel ke Node.js Virtual Environment ko activate karega
# 2. Prisma Client generate karega (DeliveryStatus error prevent karega)
# 3. Database me naye changes safe tareeqe se push karega (Bina kisi data loss ke)
# 4. cPanel server ko automatically restart kar dega (tmp/restart.txt)
# ==============================================================================

echo "🔄 [1/4] Activating Node.js Environment..."
source $(find ~/nodevenv -name activate | head -n 1)

echo "⚙️  [2/4] Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "🚀 [3/4] Syncing Database Schema (Safe - No Data Loss)..."
# Note: Bina --accept-data-loss ke ye chalega, jisse koi bhi data delete nahi ho sakta
npx prisma db push --schema=./prisma/schema.prisma

echo "🔄 [4/4] Restarting cPanel Server..."
mkdir -p tmp
touch tmp/restart.txt

echo "=========================================================="
echo "✅ Mubarak ho! Database sync ho gaya aur Server restart ho gaya!"
echo "=========================================================="
