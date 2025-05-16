/**
 * Using Supabase SDK directly to avoid ESM URL scheme issues
 * This approach should work for Node.js development and Vercel deployment
 */

import { createClient } from '@supabase/supabase-js';
import * as schema from '~/db/schema';

// Initialize database connection
let db: any;

try {
  console.log('🔵 [DB] Initializing Supabase connection');
  
  // Check for Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY)');
  }
  
  // Create Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  console.log('✅ [DB] Supabase client created');
  
  // Create a database adapter that works similarly to the original Drizzle interface
  db = {
    // Method to select records from a table
    async select(options: any) {
      const { id, table, fields, where, limit, orderBy } = options;
      const tableName = typeof table === 'string' ? table : table._; 
      
      console.log(`🔵 [DB] Running SELECT on ${tableName}`);
      
      let query = supabase
        .from(tableName)
        .select(Object.values(fields).join(','));
        
      // Handle WHERE conditions
      if (where) {
        // Match based on table.column = value pattern
        Object.entries(where).forEach(([key, value]) => {
          if (typeof key === 'string' && key.includes('.')) {
            // Extract column name from table.column format
            const [, column] = key.split('.');
            if (column && value !== undefined) {
              query = query.eq(column, value);
            }
          }
        });
      }
      
      // Handle ORDER BY
      if (orderBy && orderBy.field && orderBy.direction) {
        const column = orderBy.field.split('.').pop() || '';
        query = query.order(column, { ascending: orderBy.direction.toLowerCase() !== 'desc' });
      }
      
      // Handle LIMIT
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ [DB] Supabase query error:', error);
        throw error;
      }
      
      // Transform data to match the expected format with aliases
      return data.map((row: any) => {
        const result: Record<string, any> = {};
        Object.entries(fields).forEach(([alias, field]) => {
          const fieldName = String(field).split('.').pop() || '';
          result[alias] = row[fieldName];
        });
        return result;
      });
    },
    
    // Method for joining tables via multiple queries (since Supabase REST doesn't support JOIN directly)
    async leftJoin(options: any) {
      const { table, joinTable, on, fields, where, limit, orderBy } = options;
      
      // First get the main table data
      const primaryResults = await this.select({
        table,
        fields: Object.fromEntries(
          Object.entries(fields).filter(([, field]) => 
            String(field).startsWith(table) || !String(field).includes('.')
          )
        ),
        where,
        orderBy,
        limit
      });
      
      // Get IDs for the joined table query
      const joinIds = primaryResults.map((row: any) => row.id).filter(Boolean);
      
      if (joinIds.length === 0) {
        return primaryResults;
      }
      
      // Get the joined table fields
      const joinFields = Object.fromEntries(
        Object.entries(fields).filter(([, field]) => 
          String(field).startsWith(joinTable)
        )
      );
      
      // If no join fields, return the primary results
      if (Object.keys(joinFields).length === 0) {
        return primaryResults;
      }
      
      // Get related data
      const joinCondition = on.split('=').map((s: string) => s.trim());
      if (joinCondition.length !== 2) return primaryResults;
      
      const foreignKey = joinCondition[1].split('.').pop() || '';
      
      const { data: joinData } = await supabase
        .from(joinTable)
        .select(Object.values(joinFields).map(f => String(f).split('.').pop()).join(','))
        .in(foreignKey, joinIds);
      
      // Merge the results
      const joinMap = joinData?.reduce((acc: any, row: any) => {
        acc[row[foreignKey]] = row;
        return acc;
      }, {}) || {};
      
      return primaryResults.map((row: any) => {
        const joinRow = joinMap[row.id] || {};
        const result = { ...row };
        
        // Add join table fields
        Object.entries(joinFields).forEach(([alias, field]) => {
          const fieldName = String(field).split('.').pop() || '';
          result[alias] = joinRow[fieldName];
        });
        
        return result;
      });
    },
    
    // Original tables (for compatibility)
    schema
  };
  
  console.log('✅ [DB] Database interface initialized');
} catch (error) {
  console.error('❌ [DB] Error initializing database connection:', error);
  if (error instanceof Error) {
    console.error('📜 [DB] Error stack:', error.stack);
  }
  
  // Create a placeholder db object that throws helpful errors when used
  db = new Proxy({}, {
    get() {
      throw new Error('Database connection failed to initialize: ' + 
        (error instanceof Error ? error.message : String(error)));
    }
  });
}

// Export the database instance
export { db };
export { schema };