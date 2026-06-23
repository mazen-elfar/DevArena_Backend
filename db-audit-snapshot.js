import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportMetadata() {
    console.log('Phase 1: Evidence-Based Database Metadata Extraction...');
    
    // 1. All Tables
    const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    `;
    
    // 2. All Columns
    const columns = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    `;
    
    // 3. All Enums
    const enums = await prisma.$queryRaw`
        SELECT n.nspname as schema_name, t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        ORDER BY enum_name, enum_value;
    `;

    // 4. All Indexes
    const indexes = await prisma.$queryRaw`
        SELECT
            t.relname as table_name,
            i.relname as index_name,
            a.attname as column_name
        FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a
        WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND t.relname NOT LIKE 'pg_%'
            AND t.relname NOT LIKE 'sql_%'
        ORDER BY
            t.relname,
            i.relname;
    `;

    // 5. All Foreign Keys
    const fks = await prisma.$queryRaw`
        SELECT
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;

    const snapshot = {
        timestamp: new Date().toISOString(),
        tables: tables.map(t => t.table_name),
        columns,
        enums,
        indexes,
        fks
    };

    fs.writeFileSync('db-evidence-snapshot.json', JSON.stringify(snapshot, null, 2));
    console.log('Metadata snapshot saved to db-evidence-snapshot.json');
    await prisma.$disconnect();
}

exportMetadata().catch(err => {
    console.error('Audit Snapshot FAILED:', err);
    process.exit(1);
});
