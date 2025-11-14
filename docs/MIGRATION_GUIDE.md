# Data Migration Guide

This guide explains how to migrate data from local storage to the backend database.

## Overview

The Market Yard app currently uses browser `localStorage` for data persistence. When the backend is ready, you can export all data and import it into the database.

## Export Options

### 1. JSON Export (Recommended)

Export all data as a single JSON file:

```typescript
import { exportDataAsFile } from './services/MigrationService';

// Export as JSON
exportDataAsFile('market-yard-export.json');
```

### 2. Backend Format Export

Export data formatted specifically for backend migration:

```typescript
import { exportBackendFormat } from './services/MigrationService';

// Export in backend format
exportBackendFormat('backend-import.json');
```

### 3. CSV Export

Export each table as a separate CSV file:

```typescript
import { exportAsCSV } from './services/MigrationService';

// Export all tables as CSV
exportAsCSV();
```

### 4. SQL Export

Generate SQL INSERT statements:

```typescript
import { exportAsSQL, generateSQLInserts } from './services/MigrationService';

// Export as SQL file
exportAsSQL('migration.sql');

// Or get SQL as string
const sql = generateSQLInserts();
console.log(sql);
```

## Data Structure

### Migration Data Format

```typescript
{
  version: "1.0.0",
  exportedAt: "2024-01-01T00:00:00.000Z",
  metadata: {
    totalUsers: 10,
    totalShops: 5,
    totalProducts: 50,
    // ... other counts
  },
  data: {
    users: [...],
    shops: [...],
    products: [...],
    // ... other tables
  }
}
```

### Backend Format

```typescript
{
  version: "1.0.0",
  exportedAt: "2024-01-01T00:00:00.000Z",
  tables: {
    users: [...],
    shops: [...],
    products: [...],
    shop_products: [...],
    price_updates: [...],
    subscriptions: [...],
    payments: [...],
    favorites: [...],
    notifications: [...]
  }
}
```

## Backend Import Scripts

### Node.js/TypeScript Example

```typescript
import fs from 'fs';
import { MigrationData } from './types';

async function importToDatabase(migrationFile: string) {
  const data: MigrationData = JSON.parse(
    fs.readFileSync(migrationFile, 'utf-8')
  );

  // Import users
  for (const user of data.data.users) {
    await db.query(
      'INSERT INTO users (id, phone_number, name, email, ...) VALUES ($1, $2, $3, ...)',
      [user.id, user.phone_number, user.name, user.email, ...]
    );
  }

  // Import shops
  for (const shop of data.data.shops) {
    await db.query(
      'INSERT INTO shops (id, owner_id, name, ...) VALUES ($1, $2, $3, ...)',
      [shop.id, shop.owner_id, shop.name, ...]
    );
  }

  // Continue for other tables...
}
```

### Python Example

```python
import json
import psycopg2

def import_to_database(migration_file):
    with open(migration_file, 'r') as f:
        data = json.load(f)
    
    conn = psycopg2.connect("dbname=mydb user=myuser")
    cur = conn.cursor()
    
    # Import users
    for user in data['data']['users']:
        cur.execute(
            "INSERT INTO users (id, phone_number, name, email, ...) VALUES (%s, %s, %s, ...)",
            (user['id'], user['phone_number'], user['name'], user['email'], ...)
        )
    
    # Import shops
    for shop in data['data']['shops']:
        cur.execute(
            "INSERT INTO shops (id, owner_id, name, ...) VALUES (%s, %s, %s, ...)",
            (shop['id'], shop['owner_id'], shop['name'], ...)
        )
    
    conn.commit()
    cur.close()
    conn.close()
```

## Migration Checklist

1. **Export Data**
   - [ ] Export all data using `exportDataAsFile()`
   - [ ] Verify export file contains all expected data
   - [ ] Check migration summary for record counts

2. **Backup**
   - [ ] Create backup of export file
   - [ ] Store backup in secure location

3. **Import to Backend**
   - [ ] Set up database schema
   - [ ] Run import script
   - [ ] Verify data integrity
   - [ ] Check foreign key relationships

4. **Validation**
   - [ ] Compare record counts
   - [ ] Spot check sample records
   - [ ] Verify relationships (users → shops, etc.)
   - [ ] Test application with migrated data

5. **Switch to API Mode**
   - [ ] Update `REACT_APP_API_URL` environment variable
   - [ ] Test API connectivity
   - [ ] Switch services to use API client

## Important Notes

- **ID Preservation**: All IDs are preserved during export/import
- **Timestamps**: All `created_at` and `updated_at` timestamps are preserved
- **Relationships**: Foreign key relationships are maintained
- **Data Types**: Ensure backend schema matches TypeScript types
- **Validation**: Validate data before import to prevent errors

## Troubleshooting

### Missing Data
If some data is missing after import:
1. Check export file contains all tables
2. Verify import script processes all tables
3. Check for errors in import logs

### Foreign Key Errors
If foreign key constraints fail:
1. Import tables in dependency order:
   - Users first
   - Shops (depends on users)
   - Products
   - Shop Products (depends on shops and products)
   - Price Updates (depends on shop products)
   - Subscriptions (depends on users)
   - Payments (depends on subscriptions)
   - Favorites (depends on users)
   - Notifications (depends on users)

### Data Type Mismatches
If data types don't match:
1. Check backend schema matches TypeScript types
2. Convert data types during import if needed
3. Update schema if necessary

## Support

For issues or questions about data migration, please refer to:
- Database schema: `docs/DATABASE_SCHEMA.md`
- Type definitions: `src/types/index.ts`
- Migration service: `src/services/MigrationService.ts`

